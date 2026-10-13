import type { JSX } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell as OxygenAppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
} from "@wso2/oxygen-ui";
import { FileText, Settings, User } from "@wso2/oxygen-ui-icons-react";
import { Can } from "../authz/gates";
import { SCREEN_ROUTES } from "../authz/screens";
import { signOut } from "../authz/session";
import { APP_NAME } from "../appName";
import { useProfile } from "./useProfile";

const NAV = SCREEN_ROUTES.filter((screen) => screen.nav);

function activeKey(pathname: string): string {
  const hit = SCREEN_ROUTES.find((s) => pathname === s.path || pathname.startsWith(`${s.path.split("/:")[0]}/`));
  if (!hit) return "";
  // A claim's form and detail belong to My Claims in the rail.
  return hit.key === "claim-form" || hit.key === "claim-detail" ? "dashboard" : hit.key;
}

/** The app chrome: header with the user menu, the sidebar rail, the footer. */
export function AppShell(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profile = useProfile();

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={profile.name || "Account"} />
              <UserMenu.Header name={profile.name} email={profile.email} />
              <UserMenu.Item icon={<User />} label="Account" onClick={() => navigate("/account")} />
              <UserMenu.Item icon={<Settings />} label="Settings" onClick={() => navigate("/settings")} />
              <UserMenu.Divider />
              <UserMenu.Logout label="Sign out" onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={activeKey(pathname)}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {NAV.map((screen) =>
                screen.loads === null ? null : (
                  <Can key={screen.key} op={screen.loads}>
                    <Sidebar.Item id={screen.key} link={<Link to={screen.path} />}>
                      <Sidebar.ItemIcon>
                        <FileText />
                      </Sidebar.ItemIcon>
                      <Sidebar.ItemLabel>{screen.label}</Sidebar.ItemLabel>
                    </Sidebar.Item>
                  </Can>
                ),
              )}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© 2026 WSO2 LLC.</Footer.Copyright>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}
