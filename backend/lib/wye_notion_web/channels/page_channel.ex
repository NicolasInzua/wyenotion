defmodule WyeNotionWeb.PageChannel do
  @moduledoc """
  Handles updates to a page
  """

  use WyeNotionWeb, :channel

  alias WyeNotion.Page
  alias WyeNotion.PageServer

  @impl true
  def join("page:" <> slug, %{"username" => username}, socket) do
    {:ok, %Page{content: content}} = Page.insert_or_get(slug)

    case PageServer.add_user(slug, username) do
      :ok ->
        send(self(), :broadcast_user_list)

        assigns =
          assign(socket,
            remove_user_from_page: fn -> PageServer.remove_user(slug, username) end
          )

        {:ok, content, assigns}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  @impl true
  def join(_, _payload, _socket) do
    {:error, %{reason: "not found"}}
  end

  @impl true
  def terminate(_, %{assigns: %{remove_user_from_page: remove_user_from_page}} = socket) do
    remove_user_from_page.()
    broadcast_user_list(socket)
  end

  @impl true
  def terminate(_, _), do: :noop

  def broadcast_user_list(socket) do
    %{topic: "page:" <> slug} = socket

    broadcast(
      socket,
      "user_list",
      %{
        body:
          PageServer.users_here(slug)
      }
    )
  end

  @impl true
  def handle_info(:broadcast_user_list, socket) do
    broadcast_user_list(socket)
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_change", %{"body" => body}, %{topic: "page:" <> slug} = socket) do
    Page.update_content(slug, body)

    broadcast(socket, "new_change", %{body: body})

    {:reply, :ok, socket}
  end
end
