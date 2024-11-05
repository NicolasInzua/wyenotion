defmodule WyeNotionWeb.PageChannelTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.Page
  alias WyeNotion.Repo
  alias WyeNotionWeb.PageChannel

  setup do
    # Because the the channels spawned by a test
    # are linked to the test process, this line is needed
    # in order to do tests that leave a channel
    Process.flag(:trap_exit, true)

    socket = socket(WyeNotionWeb.UserSocket, "user_id", %{some: :assign})

    start_supervised!({DynamicSupervisor, name: WyeNotion.PageServer.supervisor_name()})

    start_supervised!({Registry, keys: :unique, name: WyeNotion.PageServer.registry_name()})

    %{socket: socket}
  end

  describe "join/3" do
    test "joining a new page inserts it into the database", %{socket: socket} do
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      assert [%Page{slug: "slug", content: nil}] = Repo.all(Page)
    end

    test "joining an existing page does not insert it into the database", %{socket: socket} do
      page = Repo.insert!(%Page{slug: "slug", content: nil})

      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      assert [page] == Repo.all(Page)
    end

    test "joining adds username to list", %{socket: socket} do
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
      assert_broadcast "user_list", %{body: ["juan"]}
    end

    test "joining an arbitrary topic returns a not found error", %{socket: socket} do
      assert {:error, %{reason: "not found"}} == subscribe_and_join(socket, PageChannel, "topic")
    end

    test "joining with the same topic and username is idempotent", %{socket: socket} do
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
      assert_broadcast "user_list", %{body: ["juan"]}
    end
  end

  describe "handle_in/3 with y_update" do
    setup(%{socket: socket}) do
      {:ok, _, socket} =
        subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      %{socket: socket}
    end

    test "the payload is broadcasted", %{socket: socket} do
      serialized_update = "1,2,3"
      ref = push(socket, "y_update", serialized_update)

      assert_reply ref, :ok
      assert_broadcast "y_update_broadcasted", %{serialized_update: ^serialized_update}
    end

    test "the state_as_update of the page is updated", %{socket: socket} do
      serialized_update = "1,2,3"
      ref = push(socket, "y_update", serialized_update)

      assert_reply ref, :ok

      assert %Page{slug: "slug", state_as_update: ^serialized_update} =
               Repo.get_by!(Page, slug: "slug")
    end
  end

  describe "terminate/2" do
    test "leaving takes username off list", %{socket: socket} do
      {:ok, _, socket} = subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "pedro"})
      leave(socket)
      assert_broadcast "user_list", %{body: ["pedro"]}
    end
  end

  describe "E2E functioning" do
    test "the joined users list is kept alive after the first one leaves", %{socket: socket} do
      {:ok, _, first_user_socket} =
        subscribe_and_join(socket, PageChannel, "page:slug", %{username: "first_john"})

      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "second_john"})

      leave(first_user_socket)

      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "first_john"})

      assert_broadcast "user_list", %{body: ["second_john"]}
    end
  end
end
