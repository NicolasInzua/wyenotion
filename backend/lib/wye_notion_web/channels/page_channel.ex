defmodule WyeNotionWeb.PageChannel do
  @moduledoc """
  Handles updates to a page
  """

  use WyeNotionWeb, :channel

  alias WyeNotion.Page

  @impl true

  def join("page:" <> slug, _payload, socket) do
    {:ok, %Page{content: content}} = Page.insert_or_get(slug)
    {:ok, content, socket}
  end

  @impl true
  def join(_, _payload, _socket) do
    {:error, %{reason: "not found"}}
  end

  @impl true
  def handle_in("new_change", %{"body" => body}, %{topic: "page:" <> slug} = socket) do
    Page.update_content(slug, body)

    broadcast(socket, "new_change", %{body: body})

    {:reply, :ok, socket}
  end
end
