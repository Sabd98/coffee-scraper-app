// config untuk menggabung classname component ui dengan classname diluar komponent

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

