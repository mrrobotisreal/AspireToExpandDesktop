import React from "react";
import { CircularProgress } from "@mui/material";

const CircularLoading = () => {
  return (
    <>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="progressGradient" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="0%" stopColor="#fbc531" />
            <stop offset="100%" stopColor="#4a90e2" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        size={40}
        thickness={6}
        variant="indeterminate"
        sx={{
          "svg circle": {
            stroke: "url(#progressGradient)",
          },
        }}
      />
    </>
  );
};

export default CircularLoading;
