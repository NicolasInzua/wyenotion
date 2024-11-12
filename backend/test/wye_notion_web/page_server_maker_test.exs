defmodule WyeNotionWeb.PageServerMakerTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.PageServerMaker
  alias WyeNotion.PageUserListServer

  setup do
    start_supervised!({DynamicSupervisor, name: WyeNotion.PageServerMaker.supervisor_name()})
    start_supervised!({Registry, keys: :unique, name: WyeNotion.PageServerMaker.registry_name()})
    :ok
  end

  describe "get_server!/1" do
    test "is idempotent" do
      pid_1 = PageServerMaker.get_server!(PageUserListServer, "test_page")
      pid_2 = PageServerMaker.get_server!(PageUserListServer, "test_page")

      assert pid_1 == pid_2
    end

    test "returns  a corresponding server PID" do
      res = PageServerMaker.get_server!(PageUserListServer, "test_page")

      [{pid, _} | _] =
        Registry.lookup(
          WyeNotion.PageServerMaker.registry_name(),
          PageServerMaker.server_id(PageUserListServer, "test_page")
        )

      assert pid == res
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServerMaker.supervisor_name(),
        %{
          id: PageServerMaker.server_id(PageUserListServer, "test_page"),
          start: {PageUserListServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageServerMaker.get_server!(PageUserListServer, "test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageServerMaker.get_server!(PageUserListServer, "test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end

  describe "get_server/1" do
    test "is idempotent" do
      pid_1 = PageServerMaker.get_server!(PageUserListServer, "test_page")
      pid_2 = PageServerMaker.get_server!(PageUserListServer, "test_page")

      assert pid_1 == pid_2
    end

    test "returns a tuple containing :ok and a corresponding server PID" do
      res = PageServerMaker.get_server(PageUserListServer, "test_page")

      [{pid, _} | _] =
        Registry.lookup(
          WyeNotion.PageServerMaker.registry_name(),
          PageServerMaker.server_id(PageUserListServer, "test_page")
        )

      assert {:ok, pid} == res
    end

    test "uses an existing corresponding server if it was present" do
      # corresponding server
      DynamicSupervisor.start_child(
        PageServerMaker.supervisor_name(),
        %{
          id: PageServerMaker.server_id(PageUserListServer, "test_page"),
          start: {PageUserListServer, :start_link, ["test_page"]},
          restart: :transient
        }
      )

      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageServerMaker.get_server(PageUserListServer, "test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before == servers_after
    end

    test "creates a corresponding server if it was not present" do
      %{active: servers_before} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      PageServerMaker.get_server(PageUserListServer, "test_page")

      %{active: servers_after} =
        DynamicSupervisor.count_children(PageServerMaker.supervisor_name())

      assert servers_before + 1 == servers_after
    end
  end
end
