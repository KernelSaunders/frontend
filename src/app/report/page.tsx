export default function Report() {
    return(
        <main className="reportpage">
            <div className="reportcontainer">
                <h1>Report an issue</h1>

                <form action="">
                    <div className="formrow">
                        <label htmlFor="issueType">Type of issue: </label>
                        <select id="issueType" className="reportinput">
                            <option>None</option>
                            <option>Wrong claim</option>
                            <option>Bugs</option>
                            <option>Other</option>
                        </select>
                    </div>
                </form>
            </div>
        </main>
    )
}