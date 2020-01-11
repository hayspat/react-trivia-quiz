import React from "react";
import "./Button.css";

type PropTypes = {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
};

const Button = (props: PropTypes) => {
  return (
    <button className="item" onClick={props.onClick} disabled={props.disabled}>
      {props.text}
    </button>
  );
};

export default Button;
