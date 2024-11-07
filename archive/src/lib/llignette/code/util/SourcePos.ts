//
// # Data structure for tracking ranges of source code.
//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//


//=====================================================================================================================

/** LineAndColumn is a line number and column number (both one-based) within a source. */
export class LineAndColumn {

    readonly line: number
    readonly column: number

    constructor(line: number, column: number) {
        this.line = line
        this.column = column
    }

}

//=====================================================================================================================

/** SourcePos represents a range of source code characters from startOffset to endOffset. */
export class SourcePos {

    readonly startOffset: number
    readonly endOffset: number

    constructor(startOffset: number,
                endOffset: number) {
        this.startOffset = startOffset
        this.endOffset = endOffset
    }
    /** Slices the given sourceCode to produce the string demarcated by the source position. */
    getText(sourceCode: string): string {
        return sourceCode.substring(this.startOffset, this.endOffset)
    }

    /** Creates a new source position extending from the start of one to the end of another. */
    thru(that: SourcePos): SourcePos {

        if (that.endOffset < this.startOffset) {
            throw Error("Source Positions not in correct order.")
        }

        return new SourcePos(
            this.startOffset,
            that.endOffset
        )

    }

    /** Converts a source position to line and column number. */
    toLineAndColumn(newLineOffsets: number[]) {

        // console.log(this)
        // console.log(newLineOffsets)

        let startLine = 1
        let startColumn = this.startOffset
        if (newLineOffsets.length > 0) {
            let iMin = 0
            let iMax = newLineOffsets.length
            // console.log({iMin,iMax})
            while (iMax - iMin > 1) {
                const iMid = Math.floor((iMin + iMax) / 2)
                // console.log({iMid,startOffset:this.startOffset,iMidOffset:newLineOffsets[iMid]})
                if (this.startOffset > newLineOffsets[iMid]) {
                    iMin = iMid
                } else {
                    iMax = iMid
                }
                // console.log({iMin,iMax})
            }
            startLine = iMin + 2
            startColumn = this.startOffset - newLineOffsets[iMin]
        }

        return new LineAndColumn(
            startLine,
            startColumn
        )

    }

}

//=====================================================================================================================
