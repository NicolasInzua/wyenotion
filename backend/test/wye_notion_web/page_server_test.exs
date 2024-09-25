defmodule WyeNotionWeb.PageServerTest do
  use WyeNotionWeb.ChannelCase

  alias WyeNotion.PageServer

  setup do
    {:ok, _} = start_supervised({DynamicSupervisor, name: WyeNotion.PageServer.supervisor_name()})
    :ok
  end

  describe "get_server!/3" do
    test "is idempotent" do
      pid_1 = PageServer.get_server!("test_page")
      pid_2 = PageServer.get_server!("test_page")

      assert ^pid_1 = pid_2
    end

    test "the gotten server survives the process that started it" do
      parent = self()

      Task.async(fn ->
        server_pid = PageServer.get_server!("test_page")
        send(parent, server_pid)
      end)
      |> Task.await()

      server_pid = PageServer.get_server!("test_page")

      assert_receive ^server_pid
    end
  end
end
