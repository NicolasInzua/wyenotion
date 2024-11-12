defmodule WyeNotion.PageServerMaker do
  @moduledoc """
  Abstracts away creating and shutting down the corresponding servers of a page
  """
  def server_id(module, page_name), do: :"#{module}:#{page_name}"

  def supervisor_name(), do: Application.fetch_env!(:wye_notion, :page_supervisor)

  def registry_name(), do: Application.fetch_env!(:wye_notion, :page_registry)

  defp registry_spec(module, page_name),
    do: {:via, Registry, {registry_name(), server_id(module, page_name), {module, page_name}}}

  defp start_under_supervisor(module, page_name),
    do:
      DynamicSupervisor.start_child(
        supervisor_name(),
        %{
          id: server_id(module, page_name),
          start: {module, :start_link, [page_name]},
          restart: :transient
        }
      )

  def start_link(module, page_name) do
    GenServer.start_link(module, page_name, name: registry_spec(module, page_name))
  end

  def get_server(module, page_name) do
    case Registry.lookup(registry_name(), server_id(module, page_name)) do
      [{pid, _} | _] ->
        {:ok, pid}

      [] ->
        case start_under_supervisor(module, page_name) do
          {:ok, pid} -> {:ok, pid}
          :ignore -> {:error, :ignore}
          err -> err
        end
    end
  end

  def get_server!(module, page_name) do
    case get_server(module, page_name) do
      {:ok, pid} -> pid
      {:error, reason} -> raise "Unable to start page server. reason: #{inspect(reason)}"
    end
  end

  def remove_page_servers(page_name) do
    Registry.select(registry_name(), [{{:_, :"$1", :"$2"}, [], [{{:"$1", :"$2"}}]}])
    |> Enum.filter(fn {_, {_, slug}} -> slug == page_name end)
    |> Enum.each(fn {server, {module, slug}} ->
      Registry.unregister(registry_name(), server_id(module, slug))
      GenServer.cast(server, :please_shutdown)
    end)
  end
end
