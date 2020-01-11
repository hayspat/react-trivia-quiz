import React from "react";

type PropTypes = {
  points: number;
};

const Finish = (props: PropTypes) => {
  return <div>Game Over you had {props.points}</div>;
};

export default Finish;
