defmodule WyeNotion.PageServer do
  @moduledoc """
  Handles the user list associated to a page
  """

  use GenServer

  def server_id(page_name), do: :"#{__MODULE__}:#{page_name}"

  def supervisor_name(), do: Application.fetch_env!(:wye_notion, :page_supervisor)

  def registry_name(), do: Application.fetch_env!(:wye_notion, :page_registry)

  defp registry_spec(page_name),
    do: {:via, Registry, {registry_name(), server_id(page_name)}}

  defp start_under_supervisor(page_name),
    do:
      DynamicSupervisor.start_child(
        supervisor_name(),
        %{
          id: server_id(page_name),
          start: {__MODULE__, :start_link, [page_name]},
          restart: :transient
        }
      )

  def start_link(page_name) do
    GenServer.start_link(__MODULE__, server_id(page_name), name: registry_spec(page_name))
  end

  def get_server(page_name) do
    case Registry.lookup(registry_name(), server_id(page_name)) do
      [{pid, _} | _] ->
        {:ok, pid}

      [] ->
        case start_under_supervisor(page_name) do
          {:ok, pid} -> {:ok, pid}
          :ignore -> {:error, :ignore}
          err -> err
        end
    end
  end

  def get_server!(page_name) do
    case get_server(page_name) do
      {:ok, pid} -> pid
      {:error, reason} -> raise "Unable to start PageServer. reason: #{inspect(reason)}"
    end
  end

  def add_user(page_slug, user) do
    get_server!(page_slug) |> GenServer.call({:add_user, user})
  end

  def remove_user(page_slug, user) do
    get_server!(page_slug) |> GenServer.call({:remove_user, user})
  end

  def users_here(page_slug) do
    get_server!(page_slug) |> GenServer.call(:users_here)
  end

  def user_here?(page_slug, user) do
    get_server!(page_slug) |> GenServer.call({:is_user_here?, user})
  end

  @impl true
  def init(server_id) do
    {:ok, %{users: MapSet.new(), server_id: server_id}}
  end

  @impl true
  def handle_call(:users_here, _from, %{users: users} = state) do
    {:reply, MapSet.to_list(users), state}
  end

  @impl true
  def handle_call({:is_user_here?, user}, _from, %{users: users} = state) do
    {:reply, MapSet.member?(users, user), state}
  end

  @impl true
  def handle_call({:remove_user, user}, _from, %{users: users, server_id: server_id} = state) do
    new_users = MapSet.delete(users, user)

    new_state = %{state | users: new_users}

    if MapSet.size(new_users) == 0 do
      Registry.unregister(registry_name(), server_id)
      {:stop, :shutdown, :ok, new_state}
    else
      {:reply, :ok, new_state}
    end
  end

  @impl true
  def handle_call({:add_user, user}, _from, %{users: users} = state) do
    new_state = %{state | users: MapSet.put(users, user)}

    if MapSet.member?(users, user) do
      {:reply, {:error, :user_already_present}, new_state}
    else
      {:reply, :ok, new_state}
    end
  end
end
