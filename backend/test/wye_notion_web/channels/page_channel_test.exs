defmodule WyeNotionWeb.PageChannelTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.Page
  alias WyeNotion.Repo
  alias WyeNotionWeb.PageChannel

  setup do
    socket = socket(WyeNotionWeb.UserSocket, "user_id", %{some: :assign})

    start_supervised({DynamicSupervisor, name: WyeNotion.PageServer.supervisor_name()})

    %{socket: socket}
  end

  describe "join/3" do
    setup do
      # Because the the channels spawned by a test
      # are linked to the test process, this line is needed
      # in order to do tests that leave a channel
      Process.flag(:trap_exit, true)
      :ok
    end

    test "joining a new page inserts it into the database", %{socket: socket} do
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      assert [%Page{slug: "slug", content: nil}] = Repo.all(Page)
    end

    test "joining an existing page returns its content", %{socket: socket} do
      Repo.insert!(%Page{slug: "slug", content: "content"})

      assert {:ok, "content", _} =
               subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
    end

    test "joining a new page returns nil", %{socket: socket} do
      assert {:ok, nil, _} =
               subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
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

    test "the joined users list is kept alive after the first one leaves", %{socket: socket} do
      {:ok, _, first_user_socket} =
        subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "pedro"})

      # first user leaves
      leave(first_user_socket)

      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "marco"})

      assert_broadcast "user_list", %{body: ["marco", "pedro"]}
    end

    test "joining an arbitrary topic returns a not found error", %{socket: socket} do
      assert {:error, %{reason: "not found"}} = subscribe_and_join(socket, PageChannel, "topic")
    end
  end

  describe "handle_in/3 with new_change" do
    setup(%{socket: socket}) do
      {:ok, _, socket} =
        subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})

      %{socket: socket}
    end

    test "the payload is broadcasted", %{socket: socket} do
      push(socket, "new_change", %{"body" => "body"})

      assert_broadcast "new_change", %{body: "body"}
    end

    test "the content of the page is updated", %{socket: socket} do
      ref = push(socket, "new_change", %{"body" => "body"})

      assert_reply ref, :ok
      assert %Page{slug: "slug", content: "body"} = Repo.get_by!(Page, slug: "slug")
    end
  end

  describe "terminate/2" do
    setup do
      # Because the the channels spawned by a test
      # are linked to the test process, this line is needed
      # in order to do tests that leave a channel
      Process.flag(:trap_exit, true)
      :ok
    end

    test "leaving takes username off list", %{socket: socket} do
      {:ok, _, socket} = subscribe_and_join(socket, PageChannel, "page:slug", %{username: "juan"})
      subscribe_and_join(socket, PageChannel, "page:slug", %{username: "pedro"})
      leave(socket)
      assert_broadcast "user_list", %{body: ["pedro"]}
    end
  end
end
