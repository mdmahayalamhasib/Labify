// Author: Sazid Ahmed Ekram
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

// Use this on routes that should work without a JWT, such as register and login.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
