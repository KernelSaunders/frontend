"use client";

import { useState } from "react";

export default function Report() {

    const [issueType, setIssueType] = useState("None");
    const [issueDetail, setIssueDetail] = useState("");

    function handleReport(e: React.FormEvent) {
        e.preventDefault();

    }

    return(
        <main className="reportpage">
            <div className="reportcontainer">
                <h1>Report an issue</h1>

                <form onSubmit={handleReport} className="form">
                    <div className="formrow">
                        <label htmlFor="issueType">Type of issue: </label>
                        <select id="issueType" className="reportinput">
                            <option>None</option>
                            <option>Wrong claim</option>
                            <option>Bugs</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="formrow">
                        <label htmlFor="issueDetail">Details: </label>
                        <textarea id="issueDetail" placeholder="Specify issue" className="reportinput"></textarea>
                    </div>
                    <div className="buttonrow">
                        <button type="submit" className="submitbutton">Submit</button>
                    </div>
                </form>
            </div>
        </main>
    )
}