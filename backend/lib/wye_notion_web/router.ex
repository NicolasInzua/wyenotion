defmodule WyeNotionWeb.Router do
  use WyeNotionWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", WyeNotionWeb do
    pipe_through :api
    get "/pages/:slug/content", PageController, :show
    get "/pages/", PageController, :index
  end

  # Enable LiveDashboard preview in development
  if Application.compile_env(:wye_notion, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: WyeNotionWeb.Telemetry
    end
  end
end
