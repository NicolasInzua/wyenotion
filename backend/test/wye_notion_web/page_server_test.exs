defmodule WyeNotionWeb.PageServerTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.PageServer

  setup do
    {:ok, _} = start_supervised({DynamicSupervisor, name: WyeNotion.PageServer.supervisor_name()})
    :ok
  end

  describe "get_server!/1" do
    test "is idempotent" do
      pid_1 = PageServer.get_server!("test_page")
      pid_2 = PageServer.get_server!("test_page")

      assert ^pid_1 = pid_2
    end

    test "returns  a corresponding PageServer PID" do
      res = PageServer.get_server!("test_page")
      pid = GenServer.whereis(PageServer.server_name("test_page"))

      assert ^res = pid
    end

    test "uses an existing corresponding server if it was present" do
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server!("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server!("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
    end
  end

  describe "get_server/1" do
    test "is idempotent" do
      pid_1 = PageServer.get_server!("test_page")
      pid_2 = PageServer.get_server!("test_page")

      assert ^pid_1 = pid_2
    end

    test "returns a tuple containing :ok and a corresponding PageServer PID" do
      res = PageServer.get_server("test_page")
      pid = GenServer.whereis(PageServer.server_name("test_page"))

      assert ^res = {:ok, pid}
    end

    test "uses an existing corresponding server if it was present" do
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.get_server("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
    end
  end

  describe "add_user/2" do
    test "user gets added" do
      PageServer.add_user("test_page", "john")
      users = PageServer.users_here("test_page")
      assert ^users = ["john"]
    end

    test "adding a user is idempotent" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "john")
      users = PageServer.users_here("test_page")
      assert ^users = ["john"]
    end

    test "uses an existing corresponding server if it was present" do
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.add_user("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.add_user("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
    end
  end

  describe "remove_user/2" do
    test "user gets removed" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "paul")

      PageServer.remove_user("test_page", "john")

      users = PageServer.users_here("test_page")

      assert ^users = ["paul"]
    end

    test "removing a non-existent user doesn't do anything" do
      PageServer.add_user("test_page", "john")
      PageServer.add_user("test_page", "paul")

      PageServer.remove_user("test_page", "mike")

      users = PageServer.users_here("test_page")

      assert ^users = ["john", "paul"]
    end

    test "successfully runs and doesn't have any effect on an empty server" do
      PageServer.remove_user("new_test_page", "john")

      users = PageServer.users_here("new_test_page")

      assert ^users = []
    end

    test "uses an existing corresponding server if it was present" do
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.remove_user("test_page", "mike")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.remove_user("test_page", "mike")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
    end
  end

  describe "users_here/1" do
    test "there are no users on a new server" do
      users = PageServer.users_here("test_page")

      assert ^users = []
    end

    test "pages don't share users" do
      PageServer.add_user("test_page_1", "john")
      PageServer.add_user("test_page_2", "paul")

      users_1 = PageServer.users_here("test_page_1")
      users_2 = PageServer.users_here("test_page_2")

      assert ^users_1 = ["john"]
      assert ^users_2 = ["paul"]
    end

    test "uses an existing corresponding server if it was present" do
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.users_here("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.users_here("test_page")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
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
      DynamicSupervisor.start_child( # corresponding server
        PageServer.supervisor_name(),
        {PageServer, PageServer.server_name("test_page")}
      )

      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.user_here?("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      PageServer.user_here?("test_page", "john")

      %{active: servers_after} = DynamicSupervisor.count_children(PageServer.supervisor_name())

      assert ^servers_after = servers_before + 1
    end
  end
end
