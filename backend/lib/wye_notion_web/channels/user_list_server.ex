defmodule WyeNotion.PageUserListServer do
  @moduledoc """
  Handles the rutinme for the user list associated to a page
  """

  alias WyeNotion.Page
  alias WyeNotion.PageUserList
  alias WyeNotion.PageServerMaker

  use GenServer

  def add_user(page_slug, user) do
    PageServerMaker.get_server!(__MODULE__, page_slug) |> GenServer.call({:add_user, user})
  end

  def remove_user(page_slug, user) do
    PageServerMaker.get_server!(__MODULE__, page_slug) |> GenServer.call({:remove_user, user})
  end

  def users_here(page_slug) do
    PageServerMaker.get_server!(__MODULE__, page_slug) |> GenServer.call(:users_here)
  end

  def start_link(page_name) do
    PageServerMaker.start_link(__MODULE__, page_name)
  end

  @impl true
  def init(page_name) do
    {:ok, Page.insert_or_get!(page_name) |> PageUserList.new()}
  end

  @impl true
  def handle_call({:add_user, user}, _from, page_data) do
    {:reply, :ok, PageUserList.add_user(page_data, user)}
  end

  @impl true
  def handle_call({:remove_user, user}, _from, page_data) do
    new_data = PageUserList.remove_user(page_data, user)

    if PageUserList.page_abandoned?(page_data) do
      PageServerMaker.remove_page_servers(PageUserList.slug(page_data))
    end

    {:reply, :ok, new_data}
  end

  @impl true
  def handle_call(:users_here, _from, page_data) do
    {:reply, PageUserList.users_here(page_data), page_data}
  end

  @impl true
  def handle_cast(:please_shutdown, page_data) do
    {:stop, :shutdown, page_data}
  end
end
