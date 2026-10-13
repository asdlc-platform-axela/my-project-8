/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// The screens table: one row per prototype screen, each naming the operation it
// loads. The order is the rail's order; the first reachable row is the landing
// screen. See thunder-authentication, section 5.

import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  /** The prototype screen's `name`, as written. */
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
  /** Listed in the sidebar rail (the prototype's AppShell `nav`). */
  readonly nav?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "dashboard", label: "My Claims", path: "/dashboard", loads: "GET /me/claims", nav: true },
  { key: "claim-form", label: "Motor Claim Form", path: "/claim-form/:claim?", loads: "POST /me/claims" },
  { key: "claim-detail", label: "Claim Detail", path: "/claim-detail/:claimId", loads: "GET /me/claims/{claimId}" },
  { key: "account", label: "Account", path: "/account", loads: null },
  { key: "settings", label: "Settings", path: "/settings", loads: null },
  { key: "signed-out", label: "Signed Out", path: "/signed-out", loads: null, public: true },
];

for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some((screen) => !screen.public && screen.loads !== null);
}
