const StatusIcon = ({
  condition,
  trueIcon = "✓",
  falseIcon = "*",
  trueClass = "text-green-500",
  falseClass = "text-red-500",
}) => {
  return (
    <span className={`${condition ? trueClass : falseClass} font-bold text-[14px] px-2`}>
      {condition ? trueIcon : falseIcon}
    </span>
  );
};

export default StatusIcon;