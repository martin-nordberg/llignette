//
// # Data types related to Llignette token scanning.
//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

// TokenType is an enumeration of Llignette token types.
export type TokenType =
    | '#TokenType_Eof'

    // Punctuation
    | '#TokenType_Ampersand'
    | '#TokenType_AmpersandAmpersand'
    | '#TokenType_AmpersandEquals'
    | '#TokenType_Asterisk'
    | '#TokenType_AsteriskAsterisk'
    | '#TokenType_AtSign'
    | '#TokenType_Colon'
    | '#TokenType_ColonColon'
    | '#TokenType_Comma'
    | '#TokenType_Dash'
    | '#TokenType_DashArrow'
    | '#TokenType_Dot'
    | '#TokenType_DotDot'
    | '#TokenType_DotDotDot'
    | '#TokenType_Equals'
    | '#TokenType_EqualsArrow'
    | '#TokenType_EqualsEquals'
    | '#TokenType_EqualsEqualsEquals'
    | '#TokenType_Exclamation'
    | '#TokenType_ExclamationEquals'
    | '#TokenType_GreaterThan'
    | '#TokenType_GreaterThanOrEquals'
    | '#TokenType_Hash'
    | '#TokenType_LeftBrace'
    | '#TokenType_LeftBracket'
    | '#TokenType_LeftParenthesis'
    | '#TokenType_LessThan'
    | '#TokenType_LessThanOrEquals'
    | '#TokenType_Plus'
    | '#TokenType_Question'
    | '#TokenType_QuestionColon'
    | '#TokenType_QuestionQuestion'
    | '#TokenType_QuestionQuestionEquals'
    | '#TokenType_RightBrace'
    | '#TokenType_RightBracket'
    | '#TokenType_RightParenthesis'
    | '#TokenType_Semicolon'
    | '#TokenType_Slash'
    | '#TokenType_Tilde'
    | '#TokenType_TildeArrow'
    | '#TokenType_TildeEquals'
    | '#TokenType_VerticalBar'

    // Keywords
    | '#TokenType_And'
    | '#TokenType_As'
    | '#TokenType_Boolean'
    | '#TokenType_False'
    | '#TokenType_Float64'
    | '#TokenType_Fn'
    | '#TokenType_In'
    | '#TokenType_Int64'
    | '#TokenType_Is'
    | '#TokenType_Mod'
    | '#TokenType_Not'
    | '#TokenType_Or'
    | '#TokenType_Otherwise'
    | '#TokenType_String'
    | '#TokenType_True'
    | '#TokenType_When'
    | '#TokenType_Xor'

    // String Literals
    | '#TokenType_BackTickedString'
    | '#TokenType_DoubleQuotedString'
    | '#TokenType_ExclamationString'
    | '#TokenType_SingleQuotedString'
    | '#TokenType_TripleBackTickedString'
    | '#TokenType_TripleDoubleQuotedString'
    | '#TokenType_TripleSingleQuotedString'

    // Other Literals
    | '#TokenType_FloatingPointLiteral'
    | '#TokenType_IntegerLiteral'

    // Identifiers
    | '#TokenType_Identifier'

    // Errors
    | '#TokenType_UnclosedString'
    | '#TokenType_UnrecognizedChar'

    ;

// ---------------------------------------------------------------------------------------------------------------------

// TextOfTokenType returns a string describing a Llignette token type.
export function textOfTokenType(tt: TokenType): string {

    switch (tt) {

        case '#TokenType_Eof':
            return "[end of file]"

        // Punctuation
        case '#TokenType_Ampersand':
            return "&"
        case '#TokenType_AmpersandAmpersand':
            return "&&"
        case '#TokenType_AmpersandEquals':
            return "&="
        case '#TokenType_Asterisk':
            return "*"
        case '#TokenType_AsteriskAsterisk':
            return "**"
        case '#TokenType_AtSign':
            return "@"
        case '#TokenType_Colon':
            return ":"
        case '#TokenType_ColonColon':
            return "::"
        case '#TokenType_Comma':
            return ","
        case '#TokenType_Dash':
            return "-"
        case '#TokenType_DashArrow':
            return "->"
        case '#TokenType_Dot':
            return "."
        case '#TokenType_DotDot':
            return ".."
        case '#TokenType_DotDotDot':
            return "..."
        case '#TokenType_Equals':
            return "="
        case '#TokenType_EqualsArrow':
            return "=>"
        case '#TokenType_EqualsEquals':
            return "=="
        case '#TokenType_EqualsEqualsEquals':
            return "==="
        case '#TokenType_Exclamation':
            return "!"
        case '#TokenType_ExclamationEquals':
            return "!="
        case '#TokenType_GreaterThan':
            return ">"
        case '#TokenType_GreaterThanOrEquals':
            return ">="
        case '#TokenType_Hash':
            return "#"
        case '#TokenType_LeftBrace':
            return "{"
        case '#TokenType_LeftBracket':
            return "["
        case '#TokenType_LeftParenthesis':
            return "("
        case '#TokenType_LessThan':
            return "<"
        case '#TokenType_LessThanOrEquals':
            return "<="
        case '#TokenType_Plus':
            return "+"
        case '#TokenType_Question':
            return "?"
        case '#TokenType_QuestionColon':
            return "?:"
        case '#TokenType_QuestionQuestion':
            return "??"
        case '#TokenType_QuestionQuestionEquals':
            return "??="
        case '#TokenType_RightBrace':
            return "}"
        case '#TokenType_RightBracket':
            return "]"
        case '#TokenType_RightParenthesis':
            return ")"
        case '#TokenType_Semicolon':
            return ";"
        case '#TokenType_Slash':
            return "/"
        case '#TokenType_Tilde':
            return "~"
        case '#TokenType_TildeArrow':
            return "~>"
        case '#TokenType_TildeEquals':
            return "~="
        case '#TokenType_VerticalBar':
            return "|"

        // Keywords
        case '#TokenType_And':
            return "and"
        case '#TokenType_As':
            return "as"
        case '#TokenType_Boolean':
            return "Boolean"
        case '#TokenType_False':
            return "false"
        case '#TokenType_Float64':
            return "Float64"
        case '#TokenType_Fn':
            return "fn"
        case '#TokenType_In':
            return "in"
        case '#TokenType_Int64':
            return "Int64"
        case '#TokenType_Is':
            return "is"
        case '#TokenType_Mod':
            return "mod"
        case '#TokenType_Not':
            return "not"
        case '#TokenType_Or':
            return "or"
        case '#TokenType_Otherwise':
            return "otherwise"
        case '#TokenType_String':
            return "String"
        case '#TokenType_True':
            return "true"
        case '#TokenType_When':
            return "when"
        case '#TokenType_Xor':
            return "xor"

        // Literal Strings
        case '#TokenType_BackTickedString':
            return "[back-ticked string]"
        case '#TokenType_DoubleQuotedString':
            return "[double quoted string]"
        case '#TokenType_ExclamationString':
            return "[double quoted string]"
        case '#TokenType_SingleQuotedString':
            return "[single quoted string]"
        case '#TokenType_TripleBackTickedString':
            return "[triple back-ticked string]"
        case '#TokenType_TripleDoubleQuotedString':
            return "[triple double quoted string]"
        case '#TokenType_TripleSingleQuotedString':
            return "[triple single quoted string]"

        // Other Literals
        case '#TokenType_FloatingPointLiteral':
            return "[floating point literal]"
        case '#TokenType_IntegerLiteral':
            return "[integer literal]"

        // Identifiers
        case '#TokenType_Identifier':
            return "[identifier]"

        // Errors
        case '#TokenType_UnclosedString':
            return "[error - string literal extends past end of line]"
        case '#TokenType_UnrecognizedChar':
            return "[error - unrecognized character]"

    }
}

//=====================================================================================================================
