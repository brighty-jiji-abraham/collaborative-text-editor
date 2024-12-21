import React from "react";
import "./Button.css";
import PropTypes from "prop-types";

const Button = ({ Name, type, text, onClick, iconComponent, disabled }) => {
  return (
    <button type={type} className={Name?Name:"button"} onClick={onClick} disabled={disabled}>
      {iconComponent && iconComponent } { text }
    </button>
  );
};

Button.propTypes = {
  Name: PropTypes.string,
  type: PropTypes.string,
  text: PropTypes.string,
  onClick: PropTypes.func,
  iconComponent: PropTypes.element,
  disabled: PropTypes.bool,
};

export default Button;
