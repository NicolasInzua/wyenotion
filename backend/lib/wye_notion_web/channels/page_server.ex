defmodule WyeNotion.PageServer do
  @moduledoc """
  Handles the user list associated to a page
  """

  use GenServer

  def get_server(page_name) do
    case GenServer.whereis(server_name(page_name)) do
      nil ->
        DynamicSupervisor.start_child(
          supervisor_name(),
          %{
            id: server_name(page_name),
            start: {__MODULE__, :start_link, [server_name(page_name)]},
            restart: :transient
          }
        )

      result ->
        {:ok, result}
    end
  end

  def server_name(page_name) do
    :"#{__MODULE__}:#{page_name}"
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
  def init(_) do
    {:ok, %{users: MapSet.new()}}
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
  def handle_call({:remove_user, user}, _from, %{users: users} = state) do
    new_users = MapSet.delete(users, user)

    new_state = %{state | users: new_users}

    if MapSet.size(new_users) == 0 do
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
