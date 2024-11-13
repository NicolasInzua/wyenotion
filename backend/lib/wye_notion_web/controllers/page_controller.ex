defmodule WyeNotionWeb.PageController do
  use WyeNotionWeb, :controller

  import Ecto.Query

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

  def index(conn, _) do
    query = from p in Page, select: p.slug
    page_slugs = Repo.all(query)
    json(
        conn,
        page_slugs
      )
  end
end
