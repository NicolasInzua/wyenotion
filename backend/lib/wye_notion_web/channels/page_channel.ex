defmodule WyeNotionWeb.PageChannel do
  use WyeNotionWeb, :channel

  @impl true
  def join("page:lobby", _payload, socket) do
    {:ok, socket}
  end

  @impl true
  def join(_, _payload, _socket) do
    {:error, %{reason: "not found"}}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (page:lobby).
  @impl true
  def handle_in("new_change", payload, socket) do
    broadcast(socket, "new_change", payload)
    {:noreply, socket}
  end
end
