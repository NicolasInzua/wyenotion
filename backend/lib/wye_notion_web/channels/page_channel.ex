defmodule WyeNotionWeb.PageChannel do
  @moduledoc """
  Handles updates to a page
  """

  use WyeNotionWeb, :channel

  alias WyeNotion.PageUserListServer
  alias WyeNotion.PageContentServer

  @impl true
  def join("page:" <> slug, %{"username" => username}, socket) do
    PageUserListServer.add_user(slug, username)
    send(self(), :broadcast_user_list)

    assigns =
      assign(socket,
        on_terminate: fn -> PageUserListServer.remove_user(slug, username) end
      )

    {:ok, assigns}
  end

  @impl true
  def join(_, _payload, _socket) do
    {:error, %{reason: "not found"}}
  end

  @impl true
  def terminate(_, %{assigns: %{on_terminate: on_terminate}} = socket) do
    on_terminate.()
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
        body: PageUserListServer.users_here(slug)
      }
    )
  end

  @impl true
  def handle_info(:broadcast_user_list, socket) do
    broadcast_user_list(socket)
    {:noreply, socket}
  end

  @impl true
  def handle_in("y_update", serialized_update, %{topic: "page:" <> slug} = socket) do
    PageContentServer.add_stringified_update(slug, serialized_update)
    broadcast(socket, "y_update_broadcasted", %{serialized_update: serialized_update})
    {:reply, :ok, socket}
  end
end
