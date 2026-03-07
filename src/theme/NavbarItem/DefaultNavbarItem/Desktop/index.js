/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import clsx from "clsx";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";

export default function DefaultNavbarItemDesktop({
  className,
  isDropdownItem = false,
  buttonType,
  ...props
}) {
  const element = (
    <NavbarNavLink
      className={clsx(
        isDropdownItem ? "dropdown__link" : "navbar__item navbar__link",
        buttonType,
        className,
      )}
      isDropdownLink={isDropdownItem}
      data-button-type={buttonType || undefined}
      {...props}
    />
  );
  if (isDropdownItem) {
    return <li>{element}</li>;
  }
  return element;
}
