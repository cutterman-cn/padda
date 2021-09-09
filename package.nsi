; Installer for Ps Plugins
; Written by xiaoqiang
; 2018/09/28
;
; Dependencies:
; ...



!include "MUI2.nsh"
!include "WordFunc.nsh"
!include "LogicLib.nsh"
!addplugindir ".\plugin"

; ---------- customize ---------
!define PANEL_NAME "Padda"

!define PANEL_PACKAGE_NAME "${PanelPacakgeName}"
!define OUT_PUT_FILE "${OutFileName}"

;-------------------------------------------------
; Defines
!define PANEL_INSTALL_DIR "$APPDATA\Adobe\CEP\extensions"
!define COMMON_PANEL_INSTALL_DIR "$COMMONFILES\Adobe\CEP\extensions"

Name "${PANEL_NAME} Installer"
OutFile "${OUT_PUT_FILE}"
ShowInstDetails show
InstallDir ${COMMON_PANEL_INSTALL_DIR}
LangString nsisunz_text 2052 "Extract: %f (%c -> %u)"

RequestExecutionLevel admin
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro WordReplace
!insertmacro WordFind
#Icon "favicon.ico"

Section -pre

    ; Set debug mode
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.6" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.6" "PlayerDebugMode" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.7" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.7" "PlayerDebugMode" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.8" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.8" "PlayerDebugMode" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.9" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.9" "PlayerDebugMode" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.10" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.10" "PlayerDebugMode" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.11" "LogLevel" "1"
    WriteRegStr HKCU "SOFTWARE\Adobe\CSXS.11" "PlayerDebugMode" "1"
SectionEnd


Section
    SetOutPath ${COMMON_PANEL_INSTALL_DIR}

    ; install panel
    File /r "${PANEL_PACKAGE_NAME}"


SectionEnd
