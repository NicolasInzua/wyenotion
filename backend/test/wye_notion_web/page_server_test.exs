defmodule WyeNotionWeb.PageServerTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.PageServer

  setup do
    start_supervised!({DynamicSupervisor, name: WyeNotion.PageServer.supervisor_name()})
    start_supervised!({Registry, keys: :unique, name: WyeNotion.PageServer.registry_name()})
    :ok
  end

  describe "get_server!/1" do
    test "is idempotent" do
      pid_1 = PageServer.get_server!("test_page")
      pid_2 = PageServer.get_server!("test_page")

      assert pid_1 == pid_2
    end

    test "returns  a corresponding PageServer PID" do
      res = PageServer.get_server!("test_page")

      [{pid, _} | _] =
        Registry.lookup(WyeNotion.PageServer.registry_name(), PageServer.server_id("test_page"))

      assert pid == res
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        %{
          id: PageServer.server_id("test_page"),
          start: {WyeNotion.PageServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server!("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server!("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "get_server/1" do
    test "is idempotent" do
      pid_1 = PageServer.get_server!("test_page")
      pid_2 = PageServer.get_server!("test_page")

      assert pid_1 == pid_2
    end

    test "returns a tuple containing :ok and a corresponding PageServer PID" do
      res = PageServer.get_server("test_page")

      [{pid, _} | _] =
        Registry.lookup(WyeNotion.PageServer.registry_name(), PageServer.server_id("test_page"))

      assert {:ok, pid} == res
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        %{
          id: PageServer.server_id("test_page"),
          start: {WyeNotion.PageServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "add_user/2" do
    test "user gets added" do
      PageServer.add_user("test_page", "john")
      users = PageServer.users_here("test_page")
      assert ["john"] == users
    end

    test "adding a user is idempotent" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "john")
      users = PageServer.users_here("test_page")
      assert ["john"] == users
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        %{
          id: PageServer.server_id("test_page"),
          start: {WyeNotion.PageServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.add_user("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.add_user("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "remove_user/2" do
    test "user gets removed" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "paul")

      PageServer.remove_user("test_page", "john")

      users = PageServer.users_here("test_page")

      assert ["paul"] == users
    end

    test "removing a non-existent user doesn't do anything" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "paul")

      PageServer.remove_user("test_page", "mike")

      users = PageServer.users_here("test_page")

      assert ["john", "paul"] == users
    end

    test "immediately after it empties a server, the user list is still usable" do
      PageServer.add_user("new_test_page", "john")
      PageServer.remove_user("new_test_page", "john")
      PageServer.add_user("new_test_page", "john")

      users = PageServer.users_here("new_test_page")

      assert ["john"] == users
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_id("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.remove_user("test_page", "mike")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "removes an existing corresponding server upon emptying it" do
      PageServer.add_user("test_page", "mike")
      PageServer.remove_user("test_page", "mike")
      PageServer.remove_user("test_page", "mike")

      assert Registry.lookup(
               WyeNotion.PageServer.registry_name(),
               PageServer.server_id("test_page")
             ) ==
               []
    end
  end

  describe "users_here/1" do
    test "there are no users on a new server" do
      users = PageServer.users_here("test_page")

      assert [] == users
    end

    test "pages don't share users" do
      PageServer.add_user("test_page_1", "john")
      PageServer.add_user("test_page_2", "paul")

      users_1 = PageServer.users_here("test_page_1")
      users_2 = PageServer.users_here("test_page_2")

      assert ["john"] == users_1
      assert ["paul"] == users_2
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        %{
          id: PageServer.server_id("test_page"),
          start: {WyeNotion.PageServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.users_here("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.users_here("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "user_here?/2" do
    test "returns true if user is present" do
      PageServer.add_user("test_page", "john")
      assert PageServer.user_here?("test_page", "john")
    end

    test "returns false if user is not present" do
      refute PageServer.user_here?("test_page", "john")
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServer.supervisor_name(),
        %{
          id: PageServer.server_id("test_page"),
          start: {WyeNotion.PageServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.user_here?("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.user_here?("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end
end
