defmodule WyeNotionWeb.PageController do
  use WyeNotionWeb, :controller

  alias WyeNotion.Page
  alias WyeNotion.PageContentServer
  alias WyeNotion.Repo

  def show(conn, %{"slug" => slug}) do
    page = Repo.get_by(Page, slug: slug)

    if page == nil do
      Plug.Conn.resp(conn, 404, "Page not found")
    else
      json(
        conn,
        PageContentServer.state_as_stringified_update(slug)
      )
    end
  end
end
