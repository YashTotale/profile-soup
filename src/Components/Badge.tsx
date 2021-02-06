// React Imports
import React, { FC } from "react";

// Material UI Imports
import {} from "@material-ui/core";
import {} from "@material-ui/icons";

export type BadgeIcon = {
  value: string;
  label: string;
  svg: string;
} | null;

export interface BadgeData {
  name: string;
  color: string;
  link: string;
  icon: BadgeIcon;
}

interface BadgeProps extends BadgeData {
  className?: string;
}

const Badge: FC<BadgeProps> = ({
  name = "",
  color = "",
  link,
  icon,
  className,
}) => {
  if (!name.length) return null;

  const formattedColor = color.substring(1);

  const image = (
    <img
      src={encodeURI(
        `https://img.shields.io/static/v1?label=&message=${name}&color=${formattedColor}&style=for-the-badge&logo=${icon?.value}`
      )}
      alt={name}
      className={className}
    ></img>
  );

  if (link)
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );

  return image;
};

export default Badge;
