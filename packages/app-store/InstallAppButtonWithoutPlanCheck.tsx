"use client";

import type { UseAddAppMutationOptions } from "@calcom/app-store/_utils/useAddAppMutation";
import useAddAppMutation from "@calcom/app-store/_utils/useAddAppMutation";
import { deriveAppDictKeyFromType } from "@calcom/lib/deriveAppDictKeyFromType";
import type { App } from "@calcom/types/App";
import type { ComponentType } from "react";
import { InstallAppButtonMap } from "./apps.browser.generated";
import type { InstallAppButtonProps } from "./types";

export const InstallAppButtonWithoutPlanCheck = (
  props: {
    type: App["type"];
    options?: UseAddAppMutationOptions;
  } & InstallAppButtonProps
) => {
  const mutation = useAddAppMutation(null, props.options);
  const key = deriveAppDictKeyFromType(props.type, InstallAppButtonMap);
  // No installed app ships a custom install button, so the generated map is empty
  // and indexing it directly would resolve to `never`. Widening it keeps the
  // default-button fallback below reachable and type-correct.
  const installAppButtons = InstallAppButtonMap as Record<
    string,
    ComponentType<InstallAppButtonProps> | undefined
  >;
  const InstallAppButtonComponent = installAppButtons[key];
  if (!InstallAppButtonComponent)
    return (
      <>
        {props.render({
          useDefaultComponent: true,
          disabled: props.disableInstall,
          onClick: () => {
            mutation.mutate({ type: props.type });
          },
          loading: mutation.data?.setupPending,
        })}
      </>
    );

  return (
    <InstallAppButtonComponent
      render={props.render}
      onChanged={props.onChanged}
      disableInstall={props.disableInstall}
    />
  );
};
