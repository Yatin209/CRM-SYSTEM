function Avatar({ name, image, size = "md" }) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`avatar avatar-${size}`} aria-label={name}>
      {image ? <img src={image} alt={name} /> : initials}
    </span>
  );
}

export default Avatar;
