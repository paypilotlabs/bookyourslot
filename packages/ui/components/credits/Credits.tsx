import { COMPANY_NAME } from "@calcom/lib/constants";

export default function Credits() {
  return (
    <small className="text-default mx-3 mb-2 mt-1 hidden text-[0.5rem] opacity-50 lg:block">
      &copy; {new Date().getFullYear()} {COMPANY_NAME}
    </small>
  );
}
