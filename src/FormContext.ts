import React from "react";
import { InternalFormInstance } from "./interface";

const context = React.createContext<InternalFormInstance | null>(null);
export default context;
