import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { createServer } from "../../test/server";
import AuthButtons from "./AuthButtons";

async function renderComponent(user) {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <AuthButtons />
      </MemoryRouter>
    </SWRConfig>
  );
  await screen.findAllByRole("link");
}

describe("When user is NOT signed in", () => {
  createServer([
    {
      path: "/api/user",
      res: (req, res, ctx) => {
        return { user: null };
      },
    },
  ]);

  test("buttons sign in and sign up are visible", async () => {
    await renderComponent();
    const buttonSignIn = screen.getByRole("link", { name: /sign in/i });
    const buttonSignUp = screen.getByRole("link", { name: /sign up/i });

    expect(buttonSignIn).toBeInTheDocument();
    expect(buttonSignIn).toHaveAttribute("href", "/signin");
    expect(buttonSignUp).toBeInTheDocument();
    expect(buttonSignUp).toHaveAttribute("href", "/signup");
  });
  test("button sign out are NOT visible", async () => {
    await renderComponent();
    const buttonSignOut = screen.queryByRole("link", { name: /sign out/i });
    expect(buttonSignOut).not.toBeInTheDocument();
  });
});

describe("When user IS signed in", () => {
  createServer([
    {
      path: "/api/user",
      res: (req, res, ctx) => {
        return {
          user: { id: 1, email: "test@test.com" },
        };
      },
    },
  ]);

  test("buttons sign in and sign up are NOT visible", async () => {
    await renderComponent();
    const buttonSignIn = screen.queryByRole("link", { name: /sign in/i });
    const buttonSignUp = screen.queryByRole("link", { name: /sign up/i });

    expect(buttonSignIn).not.toBeInTheDocument();
    expect(buttonSignUp).not.toBeInTheDocument();
  });

  test("button sign out are visible", async () => {
    await renderComponent();
    const buttonSignOut = screen.getByRole("link", { name: /sign out/i });

    expect(buttonSignOut).toBeInTheDocument();
    expect(buttonSignOut).toHaveAttribute("href", "/signout");
  });
});
