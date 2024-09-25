defmodule WyeNotion.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      WyeNotionWeb.Telemetry,
      WyeNotion.Repo,
      {DNSCluster, query: Application.get_env(:wye_notion, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: WyeNotion.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: WyeNotion.Finch},
      # Start a worker by calling: WyeNotion.Worker.start_link(arg)
      # {WyeNotion.Worker, arg},
      # Start to serve requests, typically the last entry
      WyeNotionWeb.Endpoint,
      {DynamicSupervisor, name: WyeNotion.DynamicSupervisor, strategy: :one_for_one}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: WyeNotion.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    WyeNotionWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
