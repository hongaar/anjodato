import { format } from "date-fns";
import { toast } from "react-hot-toast";

export function sluggify(str: string) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
}

export function progress<T>(promise: Promise<T>, msg: string) {
  // toast.dismiss();
  return toast.promise(promise, {
    loading: msg,
    success: msg,
    error: msg,
  });
}

export function dateFormat(date: Date) {
  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  return new Intl.DateTimeFormat("nl", formatOptions).format(date);
}

export function daterangeFormat(date1: Date, date2: Date) {
  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  return new Intl.DateTimeFormat("nl", formatOptions).formatRange(date1, date2);
}

export function formatIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}
