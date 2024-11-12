defmodule WyeNotionWeb.PageUserListServerTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.PageUserListServer
  alias WyeNotion.PageServerMaker

  setup do
    start_supervised!({DynamicSupervisor, name: WyeNotion.PageServerMaker.supervisor_name()})
    start_supervised!({Registry, keys: :unique, name: WyeNotion.PageServerMaker.registry_name()})
    :ok
  end

  describe "add_user/2" do
    test "user gets added" do
      PageUserListServer.add_user("test_page", "john")
      users = PageUserListServer.users_here("test_page")
      assert ["john"] == users
    end

    test "adding a user is idempotent" do
      PageUserListServer.add_user("test_page", "john")
      PageUserListServer.add_user("test_page", "john")
      PageUserListServer.add_user("test_page", "john")
      users = PageUserListServer.users_here("test_page")
      assert ["john"] == users
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServerMaker.supervisor_name(),
        %{
          id: PageServerMaker.server_id(PageUserListServer, "test_page"),
          start: {WyeNotion.PageUserListServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageUserListServer.add_user("test_page", "john")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageUserListServer.add_user("test_page", "john")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "remove_user/2" do
    test "user gets removed" do
      PageUserListServer.add_user("test_page", "john")
      PageUserListServer.add_user("test_page", "paul")

      PageUserListServer.remove_user("test_page", "john")

      users = PageUserListServer.users_here("test_page")

      assert ["paul"] == users
    end

    test "removing a non-existent user doesn't do anything" do
      PageUserListServer.add_user("test_page", "john")
      PageUserListServer.add_user("test_page", "paul")

      PageUserListServer.remove_user("test_page", "mike")

      users = PageUserListServer.users_here("test_page")

      assert ["john", "paul"] == users
    end

    test "immediately after it empties a server, the user list is still usable" do
      PageUserListServer.add_user("new_test_page", "john")
      PageUserListServer.remove_user("new_test_page", "john")
      PageUserListServer.add_user("new_test_page", "john")

      users = PageUserListServer.users_here("new_test_page")

      assert ["john"] == users
    end

    test "removes an existing corresponding server upon emptying it" do
      PageUserListServer.add_user("test_page", "mike")
      PageUserListServer.remove_user("test_page", "mike")
      PageUserListServer.remove_user("test_page", "mike")

      assert Registry.lookup(
               WyeNotion.PageServerMaker.registry_name(),
               PageServerMaker.server_id(PageUserListServer, "test_page")
             ) ==
               []
    end
  end

  describe "users_here/1" do
    test "there are no users on a new server" do
      users = PageUserListServer.users_here("test_page")

      assert [] == users
    end

    test "pages don't share users" do
      PageUserListServer.add_user("test_page_1", "john")
      PageUserListServer.add_user("test_page_2", "paul")

      users_1 = PageUserListServer.users_here("test_page_1")
      users_2 = PageUserListServer.users_here("test_page_2")

      assert ["john"] == users_1
      assert ["paul"] == users_2
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServerMaker.supervisor_name(),
        %{
          id: PageServerMaker.server_id(PageUserListServer, "test_page"),
          start: {WyeNotion.PageUserListServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageUserListServer.users_here("test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageUserListServer.users_here("test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end
end
