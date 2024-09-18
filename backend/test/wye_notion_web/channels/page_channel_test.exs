defmodule WyeNotionWeb.PageChannelTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.Page
  alias WyeNotion.Repo
  alias WyeNotionWeb.PageChannel

  setup do
    %{socket: socket(WyeNotionWeb.UserSocket, "user_id", %{some: :assign})}
  end

  describe "join/3" do
    test "joining a new page inserts it into the database", %{socket: socket} do
      subscribe_and_join(socket, PageChannel, "page:slug")

      assert [%Page{slug: "slug", content: nil}] = Repo.all(Page)
    end

    test "joining a new page returns nil", %{socket: socket} do
      assert {:ok, nil, _} = subscribe_and_join(socket, PageChannel, "page:slug")
    end

    test "joining an existing page does not insert it into the database", %{socket: socket} do
      page = Repo.insert!(%Page{slug: "slug", content: nil})

      subscribe_and_join(socket, PageChannel, "page:slug")

      assert [page] == Repo.all(Page)
    end

    test "joining an existing page returns its content", %{socket: socket} do
      Repo.insert!(%Page{slug: "slug", content: "contenido"})

      assert {:ok, "contenido", _} = subscribe_and_join(socket, PageChannel, "page:slug")
    end

    test "joining an arbitrary topic returns a not found error", %{socket: socket} do
      assert {:error, %{reason: "not found"}} = subscribe_and_join(socket, PageChannel, "topic")
    end
  end

  describe "handle_in/3 with new_change" do
    setup(%{socket: socket}) do
      {:ok, _, socket} = subscribe_and_join(socket, PageChannel, "page:slug")
      %{socket: socket}
    end

    test "the payload is broadcasted", %{socket: socket} do
      push(socket, "new_change", %{"body" => "body"})

      assert_broadcast("new_change", %{body: "body"})
    end

    test "the content of the page is updated", %{socket: socket} do
      ref = push(socket, "new_change", %{"body" => "body"})

      assert_reply(ref, :ok)
      assert %Page{slug: "slug", content: "body"} = Repo.get_by!(Page, slug: "slug")
    end
  end
end
