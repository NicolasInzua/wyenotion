defmodule WyeNotion.PageTest do
  use WyeNotion.DataCase

  alias WyeNotion.Page
  alias WyeNotion.Repo

  @valid_page %Page{slug: "slug", content: "content"}

  describe "schema" do
    test "throws with nil slug" do
      assert_raise Postgrex.Error, fn -> Repo.insert(%Page{slug: nil}) end
    end

    test "throws with repeated slug" do
      Repo.insert!(%Page{slug: "slug"})

      assert_raise Ecto.ConstraintError, fn -> Repo.insert(%Page{slug: "slug"}) end
    end

    test "accepts large content" do
      content = String.duplicate("a", 1_000_000)

      assert {:ok, %Page{content: ^content}} = Repo.insert(%Page{slug: "slug", content: content})
    end
  end

  describe "changeset/2" do
    test "is invalid when slug is nil" do
      refute Page.changeset(@valid_page, %{"slug" => nil}).valid?
    end

    test "is invalid when slug is blank" do
      refute Page.changeset(@valid_page, %{"slug" => ""}).valid?
      refute Page.changeset(@valid_page, %{"slug" => "  "}).valid?
    end

    test "is invalid when slug is repeated" do
      changeset = Page.changeset(@valid_page, %{})

      Repo.insert!(changeset)

      assert {:error, result_changeset} = Repo.insert(changeset)
      assert %_{errors: [slug: {"has already been taken", _}], valid?: false} = result_changeset
    end
  end

  describe "insert_or_get/1" do
    test "when there is no page with the given slug, inserts a new one" do
      assert {:ok, %Page{slug: "slug", content: nil}} = Page.insert_or_get("slug")
    end

    test "when there is a page with the given slug, returns it" do
      {:ok, page} = Repo.insert(@valid_page)

      assert {:ok, page} == Page.insert_or_get("slug")
    end
  end

  describe "update_content/2" do
    test "updates the content of the page with the given slug and returns ok with affected rows set to 1" do
      {:ok, %Page{id: id, content: content}} = Repo.insert(@valid_page)

      new_content = "updated #{content}"

      assert {:ok, [affected_rows: 1]} = Page.update_content("slug", new_content)

      assert %Page{content: ^new_content} = Repo.get(Page, id)
    end

    test "returns :ok with affected rows set to 0 when there is no page with the given slug" do
      assert {:ok, [affected_rows: 0]} = Page.update_content("slug", "content")
    end
  end
end
