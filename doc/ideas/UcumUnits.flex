
/**
 * Lexer for UCUM Units.
 */

package llace.ucumunits;

//import llace.ucumunits.UcumToken;
//import llace.ucumunits.UcumTokenType;

%%

%class UcumUnitsLexer
%type UcumToken
%function readNextToken
%unicode
%char
%eofval{
return new UcumEofToken(charPos());
%eofval}

%{

  private UcumAnnotationToken annotationToken(String text) {
    return new UcumAnnotationToken(text, charPos());
  }

  private UcumDotToken dotToken() {
    return new UcumDotToken(charPos());
  }

  private UcumLeftParenToken leftParenToken() {
    return new UcumLeftParenToken(charPos());
  }

  private UcumNumberToken numberToken(String text) {
    return new UcumNumberToken(text, charPos());
  }

  private UcumPrefixToken prefixToken(String text) {
    return new UcumPrefixToken(text, charPos());
  }

  private UcumPrefixOrUnitToken prefixOrUnitToken(String text) {
    return new UcumPrefixOrUnitToken(text, charPos());
  }

  private UcumRightParenToken rightParenToken() {
    return new UcumRightParenToken(charPos());
  }

  private UcumSignToken signToken(String text) {
    return new UcumSignToken(text, charPos());
  }

  private UcumSlashToken slashToken() {
    return new UcumSlashToken(charPos());
  }

  private UcumStdUnitToken unitToken(String text) {
    return new UcumStdUnitToken(text, charPos());
  }


  private int charPos() {
    return (int) yychar;
  }

%}


%%

<YYINITIAL> {

    /* Signs */
    "+"                 { return signToken("+"); }
    "-"                 { return signToken("-"); }

    /* Numbers */
    [1-9] [0-9]*        { return numberToken(yytext()); }

    /* Annotations */
    "{" [!-z|~ ]+ "}"   { return annotationToken(yytext()); }

    /* Parentheses */
    "("                 { return leftParenToken(); }
    ")"                 { return rightParenToken(); }

    /* Operators */
    "."                 { return dotToken(); }
    "/"                 { return slashToken(); }


    /* SI Prefixes */
    "Q"                 { return prefixToken("Q"); }
//  "R"
    "Y"                 { return prefixToken("Y"); }
    "Z"                 { return prefixToken("Z"); }
    "E"                 { return prefixToken("E"); }
//  "P"
//  "T"
//  "G"
    "M"                 { return prefixToken("M"); }
    "k"                 { return prefixToken("k"); }
//  "h"
    "da"                { return prefixToken("da"); }
//  "d"
    "c"                 { return prefixToken("c"); }
//  "m"
//  "u"
    "n"                 { return prefixToken("n"); }
    "p"                 { return prefixToken("p"); }
    "f"                 { return prefixToken("f"); }
//  "a"
    "z"                 { return prefixToken("z"); }
    "y"                 { return prefixToken("y"); }
    "r"                 { return prefixToken("r"); }
    "q"                 { return prefixToken("q"); }

    /* Prefix or Unit Tokens */
    "a"                 { return prefixOrUnitToken("a"); }
    "d"                 { return prefixOrUnitToken("d"); }
    "G"                 { return prefixOrUnitToken("G"); }
    "h"                 { return prefixOrUnitToken("h"); }
    "m"                 { return prefixOrUnitToken("m"); }
    "P"                 { return prefixOrUnitToken("P"); }
    "R"                 { return prefixOrUnitToken("R"); }
    "T"                 { return prefixOrUnitToken("T"); }
    "u"                 { return prefixOrUnitToken("u"); }

    /* Base Units */
//  "m"
    "s"                 { return unitToken("s" ); }
    "g"                 { return unitToken("g" ); }
    "rad"               { return unitToken("rad" ); }
    "K"                 { return unitToken("K" ); }
    "C"                 { return unitToken("C" ); }
    "cd"                { return unitToken("cd" ); }

    /* Dimensionless Units */
    "10*"               { return unitToken("10*"); }
    "10^"               { return unitToken("10^"); }
    "[pi]"              { return unitToken("[pi]"); }
    "%"                 { return unitToken("%"); }
    "[ppth]"            { return unitToken("[ppth]"); }
    "[ppm]"             { return unitToken("[ppm]"); }
    "[ppb]"             { return unitToken("[ppb]"); }
    "[pptr]"            { return unitToken("[pptr]"); }

    /* SI Units */
    "mol"               { return unitToken("mol"); }
    "sr"                { return unitToken("sr"); }
    "Hz"                { return unitToken("Hz"); }
    "N"                 { return unitToken("N"); }
    "Pa"                { return unitToken("Pa"); }
    "J"                 { return unitToken("J"); }
    "W"                 { return unitToken("W"); }
    "A"                 { return unitToken("A"); }
    "V"                 { return unitToken("V"); }
    "F"                 { return unitToken("F"); }
    "Ohm"               { return unitToken("Ohm"); }
    "S"                 { return unitToken("S"); }
    "Wb"                { return unitToken("Wb"); }
    "Cel"               { return unitToken("Cel"); }
//  "T"
    "H"                 { return unitToken("H"); }
    "lm"                { return unitToken("lm"); }
    "lx"                { return unitToken("lx"); }
    "Bq"                { return unitToken("Bq"); }
    "Gy"                { return unitToken("Gy"); }
    "Sv"                { return unitToken("Sv"); }

    /* Other ISO & ANSI Units */
    "gon"               { return unitToken("gon"); }
    "deg"               { return unitToken("deg"); }
    "'"                 { return unitToken("'"); }
    "''"                { return unitToken("''"); }
    "l"                 { return unitToken("l"); }
    "L"                 { return unitToken("L"); }
    "ar"                { return unitToken("ar"); }
    "min"               { return unitToken("min"); }
//  "h"
//  "d"
    "a_t"               { return unitToken("a_t"); }
    "a_j"               { return unitToken("a_j"); }
    "a_g"               { return unitToken("a_g"); }
//  "a"
    "wk"                { return unitToken("wk"); }
    "mo_s"              { return unitToken("mo_s"); }
    "mo_j"              { return unitToken("mo_j"); }
    "mo_g"              { return unitToken("mo_g"); }
    "mo"                { return unitToken("mo"); }
    "t"                 { return unitToken("t"); }
    "bar"               { return unitToken("bar"); }
//  "u"
    "eV"                { return unitToken("eV"); }
    "AU"                { return unitToken("AU"); }
    "pc"                { return unitToken("pc"); }

    /* Natural Units */
    "[c]"               { return unitToken("[c]"); }
    "[h]"               { return unitToken("[h]"); }
    "[k]"               { return unitToken("[k]"); }
    "[eps_0]"           { return unitToken("[eps_0]"); }
    "[mu_0]"            { return unitToken("[mu_0]"); }
    "[e]"               { return unitToken("[e]"); }
    "[m_e]"             { return unitToken("[m_e]"); }
    "[m_p]"             { return unitToken("[m_p]"); }
    "[G]"               { return unitToken("[G]"); }
    "[g]"               { return unitToken("[g]"); }
    "Torr"              { return unitToken("Torr"); }
    "atm"               { return unitToken("atm"); }
    "[ly]"              { return unitToken("[ly]"); }
    "gf"                { return unitToken("gf"); }
    "[lbf_av]"          { return unitToken("[lbf_av]"); }

    /* CGS (Non SI) Units */
    "Ky"                { return unitToken("Ky"); }
    "Gal"               { return unitToken("Gal"); }
    "dyn"               { return unitToken("dyn"); }
    "erg"               { return unitToken("erg"); }
//  "P"
    "Bi"                { return unitToken("Bi"); }
    "St"                { return unitToken("St"); }
    "Mx"                { return unitToken("Mx"); }
//  "G"
    "Oe"                { return unitToken("Oe"); }
    "Gb"                { return unitToken("Gb"); }
    "sb"                { return unitToken("sb"); }
    "Lmb"               { return unitToken("Lmb"); }
    "ph"                { return unitToken("ph"); }
    "Ci"                { return unitToken("Ci"); }
//  "R"
    "RAD"               { return unitToken("RAD"); }
    "REM"               { return unitToken("REM"); }

    /* International Customary Units */
    "[in_i]"            { return unitToken("[in_i]"); }
    "[ft_i]"            { return unitToken("[ft_i]"); }
    "[yd_i]"            { return unitToken("[yd_i]"); }
    "[mi_i]"            { return unitToken("[mi_i]"); }
    "[fth_i]"           { return unitToken("[fth_i]"); }
    "[nmi_i]"           { return unitToken("[nmi_i]"); }
    "[kn_i]"            { return unitToken("[kn_i]"); }
    "[sin_i]"           { return unitToken("[sin_i]"); }
    "[sft_i]"           { return unitToken("[sft_i]"); }
    "[syd_i]"           { return unitToken("[syd_i]"); }
    "[cin_i]"           { return unitToken("[cin_i]"); }
    "[cft_i]"           { return unitToken("[cft_i]"); }
    "[cyd_i]"           { return unitToken("[cyd_i]"); }
    "[bf_i]"            { return unitToken("[bf_i]"); }
    "[cr_i]"            { return unitToken("[cr_i]"); }
    "[mil_i]"           { return unitToken("[mil_i]"); }
    "[cml_i]"           { return unitToken("[cml_i]"); }
    "[hd_i]"            { return unitToken("[hd_i]"); }

    /* U.S. Survey Lengths */
    "[ft_us]"           { return unitToken("[ft_us]"); }
    "[yd_us]"           { return unitToken("[yd_us]"); }
    "[in_us]"           { return unitToken("[in_us]"); }
    "[rd_us]"           { return unitToken("[rd_us]"); }
    "[ch_us]"           { return unitToken("[ch_us]"); }
    "[lk_us]"           { return unitToken("[lk_us]"); }
    "[rch_us]"          { return unitToken("[rch_us]"); }
    "[rlk_us]"          { return unitToken("[rlk_us]"); }
    "[fth_us]"          { return unitToken("[fth_us]"); }
    "[fur_us]"          { return unitToken("[fur_us]"); }
    "[mi_us]"           { return unitToken("[mi_us]"); }
    "[acr_us]"          { return unitToken("[acr_us]"); }
    "[srd_us]"          { return unitToken("[srd_us]"); }
    "[smi_us]"          { return unitToken("[smi_us]"); }
    "[sct]"             { return unitToken("[sct]"); }
    "[twp]"             { return unitToken("[twp]"); }
    "[mil_us]"          { return unitToken("[mil_us]"); }

    /* British Imperial Lengths */
    "[in_br]"           { return unitToken("[in_br]"); }
    "[ft_br]"           { return unitToken("[ft_br]"); }
    "[rd_br]"           { return unitToken("[rd_br]"); }
    "[ch_br]"           { return unitToken("[ch_br]"); }
    "[lk_br]"           { return unitToken("[lk_br]"); }
    "[fth_br]"          { return unitToken("[fth_br]"); }
    "[pc_br]"           { return unitToken("[pc_br]"); }
    "[yd_br]"           { return unitToken("[yd_br]"); }
    "[mi_br]"           { return unitToken("[mi_br]"); }
    "[nmi_br]"          { return unitToken("[nmi_br]"); }
    "[kn_br]"           { return unitToken("[kn_br]"); }
    "[acr_br]"          { return unitToken("[acr_br]"); }

    /* U.S. Volumes */
    "[gal_us]"          { return unitToken("[gal_us]"); }
    "[bbl_us]"          { return unitToken("[bbl_us]"); }
    "[qt_us]"           { return unitToken("[qt_us]"); }
    "[pt_us]"           { return unitToken("[pt_us]"); }
    "[gil_us]"          { return unitToken("[gil_us]"); }
    "[foz_us]"          { return unitToken("[foz_us]"); }
    "[fdr_us]"          { return unitToken("[fdr_us]"); }
    "[min_us]"          { return unitToken("[min_us]"); }
    "[crd_us]"          { return unitToken("[crd_us]"); }
    "[bu_us]"           { return unitToken("[bu_us]"); }
    "[gal_wi]"          { return unitToken("[gal_wi]"); }
    "[pk_us]"           { return unitToken("[pk_us]"); }
    "[dqt_us]"          { return unitToken("[dqt_us]"); }
    "[dpt_us]"          { return unitToken("[dpt_us]"); }
    "[tbs_us]"          { return unitToken("[tbs_us]"); }
    "[tsp_us]"          { return unitToken("[tsp_us]"); }
    "[cup_us]"          { return unitToken("[cup_us]"); }
    "[foz_m]"           { return unitToken("[foz_m]"); }
    "[cup_m]"           { return unitToken("[cup_m]"); }
    "[tsp_m]"           { return unitToken("[tsp_m]"); }
    "[tbs_m]"           { return unitToken("[tbs_m]"); }

    /* British Imperial Volumes */
    "[gal_br]"          { return unitToken("[gal_br]"); }
    "[pk_br]"           { return unitToken("[pk_br]"); }
    "[bu_br]"           { return unitToken("[bu_br]"); }
    "[qt_br]"           { return unitToken("[qt_br]"); }
    "[pt_br]"           { return unitToken("[pt_br]"); }
    "[gil_br]"          { return unitToken("[gil_br]"); }
    "[foz_br]"          { return unitToken("[foz_br]"); }
    "[fdr_br]"          { return unitToken("[fdr_br]"); }
    "[min_br]"          { return unitToken("[min_br]"); }

    /* Avoirdupois Weights */
    "[gr]"              { return unitToken("[gr]"); }
    "[lb_av]"           { return unitToken("[lb_av]"); }
    "[oz_av]"           { return unitToken("[oz_av]"); }
    "[dr_av]"           { return unitToken("[dr_av]"); }
    "[scwt_av]"         { return unitToken("[scwt_av]"); }
    "[lcwt_av]"         { return unitToken("[lcwt_av]"); }
    "[ston_av]"         { return unitToken("[ston_av]"); }
    "[lton_av]"         { return unitToken("[lton_av]"); }
    "[stone_av]"        { return unitToken("[stone_av]"); }

    /* Troy Weights */
    "[pwt_tr]"          { return unitToken("[pwt_tr]"); }
    "[oz_tr]"           { return unitToken("[oz_tr]"); }
    "[lb_tr]"           { return unitToken("[lb_tr]"); }

    /* Apothecaries' Weights */
    "[sc_ap]"           { return unitToken("[sc_ap]"); }
    "[dr_ap]"           { return unitToken("[dr_ap]"); }
    "[oz_ap]"           { return unitToken("[oz_ap]"); }
    "[lb_ap]"           { return unitToken("[lb_ap]"); }
    "[oz_m]"            { return unitToken("[oz_m]"); }

    /* Typesetters' Lengths */
    "[lne]"             { return unitToken("[lne]"); }
    "[pnt]"             { return unitToken("[pnt]"); }
    "[pca]"             { return unitToken("[pca]"); }
    "[pnt_pr]"          { return unitToken("[pnt_pr]"); }
    "[pca_pr]"          { return unitToken("[pca_pr]"); }
    "[pied]"            { return unitToken("[pied]"); }
    "[pouce]"           { return unitToken("[pouce]"); }
    "[ligne]"           { return unitToken("[ligne]"); }
    "[didot]"           { return unitToken("[didot]"); }
    "[cicero]"          { return unitToken("[cicero]"); }

    /* Legacy Units for Heat and Temperature */
    "[degF]"            { return unitToken("[degF]"); }
    "[degR]"            { return unitToken("[degR]"); }
    "[degRe]"           { return unitToken("[degRe]"); }
    "cal_[15]"          { return unitToken("cal_[15]"); }
    "cal_[20]"          { return unitToken("cal_[20]"); }
    "cal_m"             { return unitToken("cal_m"); }
    "cal_IT"            { return unitToken("cal_IT"); }
    "cal_th"            { return unitToken("cal_th"); }
    "cal"               { return unitToken("cal"); }
    "[Cal]"             { return unitToken("[Cal]"); }
    "[Btu_39]"          { return unitToken("[Btu_39]"); }
    "[Btu_59]"          { return unitToken("[Btu_59]"); }
    "[Btu_60]"          { return unitToken("[Btu_60]"); }
    "[Btu_m]"           { return unitToken("[Btu_m]"); }
    "[Btu_IT]"          { return unitToken("[Btu_IT]"); }
    "[Btu_th]"          { return unitToken("[Btu_th]"); }
    "[Btu]"             { return unitToken("[Btu]"); }
    "[HP]"              { return unitToken("[HP]"); }
    "tex"               { return unitToken("tex"); }
    "[den]"             { return unitToken("[den]"); }

    /* Units Used Predominantly in Clinical Medicine */
    "m[H2O]"            { return unitToken("m[H2O]"); }
    "m[Hg]"             { return unitToken("m[Hg]"); }
    "[in_i'H2O]"        { return unitToken("[in_i'H2O]"); }
    "[in_i'Hg]"         { return unitToken("[in_i'Hg]"); }
    "[PRU]"             { return unitToken("[PRU]"); }
    "[wood'U]"          { return unitToken("[wood'U]"); }
    "[diop]"            { return unitToken("[diop]"); }
    "[p'diop]"          { return unitToken("[p'diop]"); }
    "%[slope]"          { return unitToken("%[slope]"); }
    "[mesh_i]"          { return unitToken("[mesh_i]"); }
    "[Ch]"              { return unitToken("[Ch]"); }
    "[drp]"             { return unitToken("[drp]"); }
    "[hnsf'U]"          { return unitToken("[hnsf'U]"); }
    "[MET]"             { return unitToken("[MET]"); }
    "[hp_X]"            { return unitToken("[hp_X]"); }
    "[hp_C]"            { return unitToken("[hp_C]"); }
    "[hp_M]"            { return unitToken("[hp_M]"); }
    "[hp_Q]"            { return unitToken("[hp_Q]"); }
    "[kp_X]"            { return unitToken("[kp_X]"); }
    "[kp_C]"            { return unitToken("[kp_C]"); }
    "[kp_M]"            { return unitToken("[kp_M]"); }
    "[kp_Q]"            { return unitToken("[kp_Q]"); }


    /* Chemical and Biochemical Units */
    "eq"                { return unitToken("eq"); }
    "osm"               { return unitToken("osm"); }
    "[pH]"              { return unitToken("[pH]"); }
    "g%"                { return unitToken("g%"); }
    "[S]"               { return unitToken("[S]"); }
    "[HPF]"             { return unitToken("[HPF]"); }
    "[LPF]"             { return unitToken("[LPF]"); }
    "kat"               { return unitToken("kat"); }
    "U"                 { return unitToken("U"); }
    "[iU]"              { return unitToken("[iU]" ); }
    "[IU]"              { return unitToken("[IU]" ); }
    "[arb'U]"           { return unitToken("[arb'U]" ); }
    "[USP'U]"           { return unitToken("[USP'U]" ); }
    "[GPL'U]"           { return unitToken("[GPL'U]" ); }
    "[MPL'U]"           { return unitToken("[MPL'U]" ); }
    "[APL'U]"           { return unitToken("[APL'U]" ); }
    "[beth'U]"          { return unitToken("[beth'U]" ); }
    "[anti'Xa'U]"       { return unitToken("[anti'Xa'U]" ); }
    "[todd'U]"          { return unitToken("[todd'U]" ); }
    "[dye'U]"           { return unitToken("[dye'U]" ); }
    "[smgy'U]"          { return unitToken("[smgy'U]" ); }
    "[bdsk'U]"          { return unitToken("[bdsk'U]" ); }
    "[ka'U]"            { return unitToken("[ka'U]" ); }
    "[knk'U]"           { return unitToken("[knk'U]" ); }
    "[mclg'U]"          { return unitToken("[mclg'U]" ); }
    "[tb'U]"            { return unitToken("[tb'U]" ); }
    "[CCID_50]"         { return unitToken("[CCID_50]" ); }
    "[TCID_50]"         { return unitToken("[TCID_50]" ); }
    "[EID_50]"          { return unitToken("[EID_50]" ); }
    "[PFU]"             { return unitToken("[PFU]" ); }
    "[FFU]"             { return unitToken("[FFU]" ); }
    "[CFU]"             { return unitToken("[CFU]" ); }
    "[IR]"              { return unitToken("[IR]" ); }
    "[BAU]"             { return unitToken("[BAU]" ); }
    "[AU]"              { return unitToken("[AU]" ); }
    "[Amb'a'1'U]"       { return unitToken("[Amb'a'1'U]" ); }
    "[PNU]"             { return unitToken("[PNU]" ); }
    "[Lf]"              { return unitToken("[Lf]" ); }
    "[D'ag'U]"          { return unitToken("[D'ag'U]" ); }
    "[FEU]"             { return unitToken("[FEU]" ); }
    "[ELU]"             { return unitToken("[ELU]" ); }
    "[EU]"              { return unitToken("[EU]" ); }

    /* Levels */
    "Np"                { return unitToken("Np" ); }
    "B"                 { return unitToken("B" ); }
    "B[SPL]"            { return unitToken("B[SPL]" ); }
    "B[V]"              { return unitToken("B[V]" ); }
    "B[mV]"             { return unitToken("B[mV]" ); }
    "B[uV]"             { return unitToken("B[uV]" ); }
    "B[10.nV]"          { return unitToken("B[10.nV]" ); }
    "B[W]"              { return unitToken("B[W]" ); }
    "B[kW]"             { return unitToken("B[kW]" ); }

    /* Miscellaneous Units */
    "st"                { return unitToken("st"); }
    "Ao"                { return unitToken("Ao"); }
    "b"                 { return unitToken("b"); }
    "att"               { return unitToken("att"); }
    "mho"               { return unitToken("mho"); }
    "[psi]"             { return unitToken("[psi]"); }
    "circ"              { return unitToken("circ"); }
    "sph"               { return unitToken("sph"); }
    "[car_m]"           { return unitToken("[car_m]"); }
    "[car_Au]"          { return unitToken("[car_Au]"); }
    "[smoot]"           { return unitToken("[smoot]"); }
    "[m/s2/Hz^(1/2)]"   { return unitToken("[m/s2/Hz^(1/2)]" ); }


    /* Units Used in Information Technology */
    "bit_s"             { return unitToken("bit_s"); }
    "bit"               { return unitToken("bit"); }
    "By"                { return unitToken("By"); }
    "Bd"                { return unitToken("Bd"); }

    /* Information Prefixes */
    "Ki"                { return prefixToken("Ki"); }
    "Mi"                { return prefixToken("Mi"); }
    "Gi"                { return prefixToken("Gi"); }
    "Ti"                { return prefixToken("Ti"); }

    /* Prefix/Unit Conflicts */
    "arad"              { yypushback(3); return prefixToken("a"); }
    "cdyn"              { yypushback(3); return prefixToken("c"); }
    "dar"               { yypushback(2); return prefixToken("d"); }
    "darad"             { yypushback(3); return prefixToken("da"); }
    "Gbar"              { yypushback(3); return prefixToken("G"); }
    "Gbit"              { yypushback(3); return prefixToken("G"); }
    "mosm"              { yypushback(3); return prefixToken("m"); }
    "Par"               { yypushback(2); return prefixToken("P"); }
    "pcal"              { yypushback(3); return prefixToken("p"); }
    "pcal_[15]"         { yypushback(8); return prefixToken("p"); }
    "pcal_[20]"         { yypushback(8); return prefixToken("p"); }
    "pcal_IT"           { yypushback(6); return prefixToken("p"); }
    "pcal_m"            { yypushback(5); return prefixToken("p"); }
    "pcal_th"           { yypushback(6); return prefixToken("p"); }
    "pcd"               { yypushback(2); return prefixToken("p"); }

}

/* error fallback */
[^]                     { throw new Error("Illegal character <" + yytext() + ">"); }
