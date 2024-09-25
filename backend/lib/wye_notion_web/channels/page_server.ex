defmodule WyeNotion.PageServer do
  @moduledoc """
  Handles the user list associated to a page
  """

  use GenServer

  def get_server(page_name) do
    # TODO: don't dynamically create atoms, use registries
    server_name = :"#{__MODULE__}:#{page_name}"

    case GenServer.whereis(server_name) do
      nil ->
        DynamicSupervisor.start_child(
          supervisor_name(),
          {__MODULE__, server_name}
        )

      result ->
        {:ok, result}
    end
  end

  def supervisor_name() do
    Application.fetch_env!(:wye_notion, :page_supervisor)
  end

  def start_link(server_name) do
    GenServer.start_link(__MODULE__, server_name, name: server_name)
  end

  def get_server!(page_name) do
    case get_server(page_name) do
      {:ok, pid} -> pid
    end
  end

  def add_user(slug, user) do
    if user_here?(slug, user) do
      {:error, :user_already_present}
    else
      get_server!(slug) |> GenServer.cast({:add_user, user})
    end
  end

  def remove_user(slug, user) do
    get_server!(slug) |> GenServer.cast({:remove_user, user})
  end

  def users_here(slug) do
    get_server!(slug) |> GenServer.call(:users_here)
  end

  def user_here?(slug, user) do
    get_server!(slug) |> GenServer.call({:is_user_here?, user})
  end

  @impl true
  def init(_) do
    {:ok, MapSet.new()}
  end

  @impl true
  def handle_call(:users_here, _from, users) do
    {:reply, MapSet.to_list(users), users}
  end

  @impl true
  def handle_call({:is_user_here?, user}, _from, users) do
    {:reply, MapSet.member?(users, user), users}
  end

  @impl true
  def handle_cast({:add_user, user}, users) do
    {:noreply, MapSet.put(users, user)}
  end

  @impl true
  def handle_cast({:remove_user, user}, users) do
    {:noreply, MapSet.delete(users, user)}
  end
end
