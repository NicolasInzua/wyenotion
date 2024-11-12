defmodule WyeNotion.PageContentServer do
  @moduledoc """
  Handles the content CRDT associated to a page
  """

  alias WyeNotion.Page
  alias WyeNotion.PageContent
  alias WyeNotion.PageServerMaker

  use GenServer

  def state_as_stringified_update(page_name) do
    PageServerMaker.get_server!(__MODULE__, page_name) |> GenServer.call(:state_as_update)
  end

  def add_stringified_update(page_name, update) do
    PageServerMaker.get_server!(__MODULE__, page_name) |> GenServer.cast({:add_update, update})
  end

  def start_link(page_name) do
    PageServerMaker.start_link(__MODULE__, page_name)
  end

  @impl true
  def init(page_name) do
    # Necessary because our supervisor could stop us in the middle of a DB query
    Process.flag(:trap_exit, true)
    {:ok, Page.insert_or_get!(page_name) |> PageContent.new()}
  end

  @impl true
  def handle_info({:EXIT, _, _}, state) do
    {:noreply, state}
  end

  @impl true
  def handle_call(:state_as_update, _from, page_data) do
    {:reply, PageContent.state_as_stringified_update(page_data), page_data}
  end

  @impl true
  def handle_cast({:add_update, update}, page_data) do
    new_page_data = PageContent.add_stringified_update(page_data, update)

    {:ok, _} =
      Page.update_state_as_update(
        PageContent.slug(new_page_data),
        PageContent.state_as_stringified_update(new_page_data)
      )

    {:noreply, new_page_data}
  end

  @impl true
  def handle_cast(:please_shutdown, page_data) do
    {:stop, :shutdown, page_data}
  end
end
