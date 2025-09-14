import React from "react";


export default function Loading(props) {
    return (
        <div className="phone_main_container">
            <div className="content_container3 center_center_vertical">
                <h1>Please Wait</h1>
                <img src="/imgs/DEX.gif" alt="" />
                <div className="center_top_vertical">
                    <span>{props.logs[props.logs.length-1][1]}%</span>
                    <span>{props.logs[props.logs.length-1][0]}</span>
                </div>
            </div>
        </div>
    )
}