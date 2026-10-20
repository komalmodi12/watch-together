import styles from "./Button.module.css";


function Button({
  children, variant = "primary", icon, onClick,
  fullWidth = false, type = "button", disabled = false,
}) {
  const classes = [styles.btn, styles[variant], fullWidth ? styles.full : ""].join(" ");

  return (
   
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

export default Button;