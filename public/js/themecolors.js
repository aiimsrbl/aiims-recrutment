const handleThemeUpdate = (cssVars) => {
    const root = document.querySelector(':root');
    const keys = Object.keys(cssVars);
    keys.forEach(key => {
        root.style.setProperty(key, cssVars[key]);
    });
}

function themeSwitch(switchProperty) {
    switchProperty.forEach((item) => {
        item.addEventListener('click', (e) => {
            const primaryColor = e.target.getAttribute('data-bg-color')
            const primaryHoverColor = e.target.getAttribute('data-bg-hover')
            const primaryBorderColor = e.target.getAttribute('data-bg-border')
            const primaryTransparent = e.target.getAttribute('data-bg-transparent')
            const secondaryColor = e.target.getAttribute('bg-color2')
            const secondaryHoverColor = e.target.getAttribute('bg-hover2')

            handleThemeUpdate({
                '--primary-bg-color': primaryColor,
                '--primary-bg-hover': primaryHoverColor,
                '--primary-bg-border': primaryBorderColor,
                '--primary-transparentcolor': primaryTransparent,
                '--secondary': secondaryColor,
                '--secondary-hover': secondaryHoverColor,
            });

            $("input.input-color-picker[data-id='bg-color']").val(primaryColor)
            $("input.input-color-picker[data-id1='bg-hover']").val(primaryColor)
            $("input.input-color-picker[data-id2='bg-border']").val(primaryColor)
            $("input.input-color-picker[data-id7='transparentcolor']").val(primaryColor)
            $("input-secondary-color-picker[data-id5='bg-color2']").val(secondaryColor)
            $("input-secondary-color-picker[data-id6='bg-hover2']").val(secondaryColor)
        });
    });
}

function dynamicPrimaryColor(primaryColor) {
    primaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName = `--primary-${e.target.getAttribute('data-id')}`;
            const cssPropName1 = `--primary-${e.target.getAttribute('data-id1')}`;
            const cssPropName2 = `--primary-${e.target.getAttribute('data-id2')}`;
            const cssPropName7 = `--primary-${e.target.getAttribute('data-id7')}`;
            handleThemeUpdate({
                [cssPropName]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName1]: e.target.value + 95,
                [cssPropName2]: e.target.value,
                [cssPropName7]: e.target.value + 20,
            });
        });
    });
}

function dynamicSecondaryColor(secondaryColor) {
    secondaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName11 = `--secondary-${e.target.getAttribute('data-id5')}`;
            const cssPropName12 = `--secondary-${e.target.getAttribute('data-id6')}`;
            handleThemeUpdate({
                [cssPropName11]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName12]: e.target.value + 95,
            });
        });
    });
}


function dynamicDarkPrimaryColor(darkprimaryColor) {
    darkprimaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName = `--primary-${e.target.getAttribute('data-id')}`;
            const cssPropName1 = `--primary-${e.target.getAttribute('data-id1')}`;
            const cssPropName2 = `--primary-${e.target.getAttribute('data-id2')}`;
            handleThemeUpdate({
                [cssPropName]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName1]: e.target.value + 95,
                [cssPropName2]: e.target.value,
            });
        });
    });
}

function dynamicDarkSecondaryColor(darksecondaryColor) {
    darksecondaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName11 = `--secondary-${e.target.getAttribute('data-id5')}`;
            const cssPropName12 = `--secondary-${e.target.getAttribute('data-id6')}`;
            handleThemeUpdate({
                [cssPropName11]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName12]: e.target.value + 95,
            });
        });
    });
}

function dynamicTransPrimaryColor(transprimaryColor) {
    transprimaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName = `--primary-${e.target.getAttribute('data-id')}`;
            const cssPropName1 = `--primary-${e.target.getAttribute('data-id1')}`;
            const cssPropName2 = `--primary-${e.target.getAttribute('data-id2')}`;
            const cssPropName7 = `--primary-${e.target.getAttribute('data-id7')}`;
            handleThemeUpdate({
                [cssPropName]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName1]: e.target.value + 95,
                [cssPropName2]: e.target.value,
                [cssPropName7]: e.target.value + 20,
            });
        });
    });
}

function dynamicTransSecondaryColor(transsecondaryColor) {
    transsecondaryColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName11 = `--secondary-${e.target.getAttribute('data-id5')}`;
            const cssPropName12 = `--secondary-${e.target.getAttribute('data-id6')}`;
            const cssPropName13 = `--secondary-${e.target.getAttribute('data-id8')}`;
            handleThemeUpdate({
                [cssPropName11]: e.target.value,
                // 95 is used as the opacity 0.95  
                [cssPropName12]: e.target.value + 95,
                [cssPropName13]: e.target.value + 20,
            });
        });
    });
}

function dynamicTransBackgroundColor(transbackgroundColor) {
    transbackgroundColor.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName12 = `--transparent-${e.target.getAttribute('data-id9')}`; 
            handleThemeUpdate({
                [cssPropName12]: e.target.value,
            });
        });
    });
}

(function() {
    // Light theme color picker
    const LightThemeSwitchers = document.querySelectorAll('.light-theme .switch_section span');
    const dynamicPrimaryLight = document.querySelectorAll('input.color-primary-light');
    const dynamicSecondaryLight = document.querySelectorAll('input.color-secondary-light');
    const dynamicPrimaryDarkColor = document.querySelectorAll('input.color-primary-dark');
    const dynamicSecondaryDark = document.querySelectorAll('input.color-secondary-dark');
    const dynamicPrimaryTransColor = document.querySelectorAll('input.color-primary-Transparent');
    const dynamicSecondaryTrans = document.querySelectorAll('input.color-secondary-Transparent');
    const dynamicBackgroundTrans = document.querySelectorAll('input.bg-primary-Transparent');

    themeSwitch(LightThemeSwitchers);
    dynamicPrimaryColor(dynamicPrimaryLight);
    dynamicSecondaryColor(dynamicSecondaryLight);
    dynamicDarkPrimaryColor(dynamicPrimaryDarkColor);
    dynamicDarkSecondaryColor(dynamicSecondaryDark);
    dynamicTransPrimaryColor(dynamicPrimaryTransColor);
    dynamicTransSecondaryColor(dynamicSecondaryTrans);
    dynamicTransBackgroundColor(dynamicBackgroundTrans);

    localStorageBackup();
})();

function localStorageBackup() {
    // if there is a value stored, update color picker and background color
    // Used to retrive the data from local storage
    if (localStorage.rejoinprimaryColor) {
        // document.getElementById('colorID').value = localStorage.rejoinprimaryColor;
        document.querySelector('html').style.setProperty('--primary-bg-color', localStorage.rejoinprimaryColor);
        document.querySelector('html').style.setProperty('--primary-bg-hover', localStorage.rejoinprimaryHoverColor);
        document.querySelector('html').style.setProperty('--primary-bg-border', localStorage.rejoinprimaryBorderColor);
        document.querySelector('html').style.setProperty('--primary-bg-transparentcolor', localStorage.rejoinprimaryTransparent);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.add('light-theme');
        document.querySelector('body').classList.remove('transparent-theme');

        $('#myonoffswitch1').prop('checked', true);


    }
    if (localStorage.rejoinsecondaryColor) {
        // document.getElementById('colorID2').value = localStorage.rejoinsecondaryColor;
        document.querySelector('html').style.setProperty('--secondary-color', localStorage.rejoinsecondaryColor);
        document.querySelector('html').style.setProperty('--secondary-hover', localStorage.rejoinsecondaryHoverColor);
        document.querySelector('html').style.setProperty('--secondary-transparent', localStorage.rejoinsecondaryTransparentColor);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.add('light-theme');
        document.querySelector('body').classList.remove('transparent-theme');

        $('#myonoffswitch1').prop('checked', true);


    }

    if (localStorage.rejoindarkPrimary) {
        // document.getElementById('darkPrimaryColorID').value = localStorage.rejoindarkPrimary;
        document.querySelector('html').style.setProperty('--primary-bg-color', localStorage.rejoindarkPrimary);
        document.querySelector('html').style.setProperty('--primary-bg-hover', localStorage.rejoinprimaryHoverColor);
        document.querySelector('html').style.setProperty('--primary-bg-border', localStorage.rejoinprimaryBorderColor);
        document.querySelector('html').style.setProperty('--primary-bg-transparentcolor', localStorage.rejoinprimaryTransparent);
        document.querySelector('body').classList.add('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.remove('transparent-theme');

        $('#myonoffswitch2').prop('checked', true);

    }
    if (localStorage.rejoindarksecondary) {
        // document.getElementById('darkColorID2').value = localStorage.rejoindarksecondary;
        document.querySelector('html').style.setProperty('--secondary-color', localStorage.rejoindarksecondary);
        document.querySelector('html').style.setProperty('--secondary-hover', localStorage.rejoinsecondaryHoverColor);
        document.querySelector('html').style.setProperty('--secondary-transparent', localStorage.rejoinsecondaryTransparentColor);
        document.querySelector('body').classList.add('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.remove('transparent-theme');

        $('#myonoffswitch2').prop('checked', true);

    }
    if (localStorage.rejointransparentPrimary) {
        // document.getElementById('TransparentPrimaryColorID').value = localStorage.rejointransparentPrimary;
        document.querySelector('html').style.setProperty('--primary-bg-color', localStorage.rejointransparentPrimary);
        document.querySelector('html').style.setProperty('--primary-bg-hover', localStorage.rejoinprimaryHoverColor);
        document.querySelector('html').style.setProperty('--primary-bg-border', localStorage.rejoinprimaryBorderColor);
        document.querySelector('html').style.setProperty('--primary-bg-transparentcolor', localStorage.rejoinprimaryTransparent);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.add('transparent-theme');

        $('#myonoffswitch3').prop('checked', true);

    }
    if (localStorage.rejointransparentsecondary) {
        // document.getElementById('TransparentColorID2').value = localStorage.rejointransparentsecondary;
        document.querySelector('html').style.setProperty('--secondary-color', localStorage.rejointransparentsecondary);
        document.querySelector('html').style.setProperty('--secondary-hover', localStorage.rejoinsecondaryHoverColor);
        document.querySelector('html').style.setProperty('--secondary-transparent', localStorage.rejoinsecondaryTransparentColor);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.add('transparent-theme');

        $('#myonoffswitch3').prop('checked', true);

    }
    if (localStorage.rejointransparentcolor) {
        // document.getElementById('TransparentPrimaryColorID3').value = localStorage.rejointransparentcolor;
        document.querySelector('html').style.setProperty('--transparent-color', localStorage.rejointransparentcolor);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.add('transparent-theme');

        $('#myonoffswitch3').prop('checked', true);

    }
    if (localStorage.rejointransparentcolor2) {
        // document.getElementById('TransparentColorID4').value = localStorage.rejointransparentcolor2;
        document.querySelector('html').style.setProperty('--transparent-color2', localStorage.rejointransparentcolor2);
        document.querySelector('body').classList.remove('dark-theme');
        document.querySelector('body').classList.remove('light-theme');
        document.querySelector('body').classList.add('transparent-theme');

        $('#myonoffswitch3').prop('checked', true);

    }
    if(localStorage.rejoinrtl){
        document.querySelector('body').classList.add('rtl');
        $('#myonoffswitch55').prop('checked', true);
    }

    if(localStorage.rejoinlightMode){
        document.querySelector('body')?.classList.add('light-theme');
		document.querySelector('body')?.classList.remove('dark-theme');
		document.querySelector('body')?.classList.remove('transparent-theme');
        $('#myonoffswitch56').prop('checked', true);
    }
    if(localStorage.rejoindarkMode){
        document.querySelector('body')?.classList.remove('light-theme');
		document.querySelector('body')?.classList.add('dark-theme');
		document.querySelector('body')?.classList.remove('transparent-theme');
        $('#myonoffswitch57').prop('checked', true);
    }
    if(localStorage.rejointransparentMode){
        document.querySelector('body')?.classList.remove('light-theme');
		document.querySelector('body')?.classList.remove('dark-theme');
		document.querySelector('body')?.classList.add('transparent-theme');
        $('#myonoffswitchTransparent').prop('checked', true);
        $('#myonoffswitch58').prop('checked', true);
    }
}

// triggers on changing the color picker
function changePrimaryColor() {

    var userColor = document.getElementById('colorID').value;
    localStorage.setItem('rejoinprimaryColor', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinprimaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinprimaryBorderColor', userColor);
    localStorage.setItem('rejoinprimaryTransparent', userColor + 20);

    // removing dark theme properties
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')
    localStorage.removeItem('rejointransparentPrimary')
    localStorage.removeItem('rejointransparentsecondary')
    localStorage.removeItem('rejointransparentcolor2')
    document.querySelector('body').classList.add('light-theme');
    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('transparent-theme');

    $('#myonoffswitch1').prop('checked', true);
    names()

    localStorage.setItem('rejoinlightMode', true);
    localStorage.removeItem('rejoindarkMode');
    localStorage.removeItem('rejointransparentMode');
}
function changeSecondaryColor() {

    var userColor = document.getElementById('colorID2').value;
    localStorage.setItem('rejoinsecondaryColor', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinsecondaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinsecondaryTransparentColor', userColor + 20);

    // removing dark theme properties
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')
    localStorage.removeItem('rejointransparentPrimary')
    localStorage.removeItem('rejointransparentsecondary')
    localStorage.removeItem('rejointransparentcolor2')
    document.querySelector('body').classList.add('light-theme');
    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('transparent-theme');

    $('#myonoffswitch1').prop('checked', true);
    names()

    localStorage.setItem('rejoinlightMode', true);
    localStorage.removeItem('rejoindarkMode');
    localStorage.removeItem('rejointransparentMode');
}

function darkPrimaryColor() {

    var userColor = document.getElementById('darkPrimaryColorID').value;
    localStorage.setItem('rejoindarkPrimary', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinprimaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinprimaryBorderColor', userColor);
    localStorage.setItem('rejoinprimaryTransparent', userColor + 20);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejointransparentPrimary')
    localStorage.removeItem('rejointransparentsecondary')
    localStorage.removeItem('rejointransparentcolor2')

    document.querySelector('body').classList.add('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.remove('transparent-theme');

    $('#myonoffswitch2').prop('checked', true);
    names()

    localStorage.setItem('rejoindarkMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejointransparentMode');
}

function changeDarkSecondaryColor() {

    var userColor = document.getElementById('darkColorID2').value;
    localStorage.setItem('rejoindarksecondary', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinsecondaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinsecondaryTransparentColor', userColor + 20);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejointransparentPrimary')
    localStorage.removeItem('rejointransparentsecondary')
    localStorage.removeItem('rejointransparentcolor2')

    document.querySelector('body').classList.add('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.remove('transparent-theme');

    $('#myonoffswitch2').prop('checked', true);
    names()

    localStorage.setItem('rejoindarkMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejointransparentMode');
}

function TransparentPrimaryColor() {

    var userColor = document.getElementById('TransparentPrimaryColorID').value;
    localStorage.setItem('rejointransparentPrimary', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinprimaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinprimaryBorderColor', userColor);
    localStorage.setItem('rejoinprimaryTransparent', userColor + 20);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('transparent-theme');

    $('#myonoffswitch3').prop('checked', true);
    names()

    localStorage.setItem('rejointransparentMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejoindarkMode');
}

function changeTransparentSecondaryColor() {

    var userColor = document.getElementById('TransparentColorID2').value;
    localStorage.setItem('rejointransparentsecondary', userColor);
    // to store value as opacity 0.95 we use 95
    localStorage.setItem('rejoinsecondaryHoverColor', userColor + 95);
    localStorage.setItem('rejoinsecondaryTransparentColor', userColor + 20);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('transparent-theme');

    $('#myonoffswitch3').prop('checked', true);
    names()

    localStorage.setItem('rejointransparentMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejoindarkMode');
}

function TransparentBackgroundColor() {

    var userColor = document.getElementById('TransparentPrimaryColorID3').value;
    localStorage.setItem('rejointransparentcolor', userColor);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('transparent-theme');

    $('#myonoffswitch3').prop('checked', true);
    names()

    localStorage.setItem('rejointransparentMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejoindarkMode');
}
function TransparentBackgroundColor2() {

    var userColor = document.getElementById('TransparentColorID4').value;
    localStorage.setItem('rejointransparentcolor2', userColor);

    // removing light theme data 
    localStorage.removeItem('rejoinprimaryColor')
    localStorage.removeItem('rejoinsecondaryColor')
    localStorage.removeItem('rejoindarkPrimary')
    localStorage.removeItem('rejoindarksecondary')

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('transparent-theme');

    $('#myonoffswitch3').prop('checked', true);
    names()

    localStorage.setItem('rejointransparentMode', true);
    localStorage.removeItem('rejoinlightMode');
    localStorage.removeItem('rejoindarkMode');
}

// to check the value is hexa or not
const isValidHex = (hexValue) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hexValue)

const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"))
    // convert hex value to 256
const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16)
    // get alpha value is equla to 1 if there was no value is asigned to alpha in function
const getAlphafloat = (a, alpha) => {
        if (typeof a !== "undefined") { return a / 255 }
        if ((typeof alpha != "number") || alpha < 0 || alpha > 1) {
            return 1
        }
        return alpha
    }
    // convertion of hex code to rgba code 
function hexToRgba(hexValue, alpha) {
    if (!isValidHex(hexValue)) { return null }
    const chunkSize = Math.floor((hexValue.length - 1) / 3)
    const hexArr = getChunksFromString(hexValue.slice(1), chunkSize)
    const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
    return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`
}


let myVarVal, myVarVal1

function names() {

    let primaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color').trim();
    let secondaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

    //get variable
    myVarVal = localStorage.getItem("rejoinprimaryColor") || localStorage.getItem("rejoindarkPrimary") || localStorage.getItem("rejointransparentPrimary") || primaryColorVal;
    myVarVal1 = localStorage.getItem("rejoinsecondaryColor") || localStorage.getItem("rejoindarksecondary") || localStorage.getItem("rejointransparentsecondary") || secondaryColorVal;

    if(document.querySelector('#sales-status') !== null){
        chartColor();
    }

    // Primary opacity

    let colorData1 = hexToRgba(myVarVal || "#1650e2", 0.86)
    document.querySelector('html').style.setProperty('--primary-09', colorData1);
    let colorData2 = hexToRgba(myVarVal || "#1650e2", 0.46)
    document.querySelector('html').style.setProperty('--primary-10', colorData2);
    let colorData3 = hexToRgba(myVarVal || "#1650e2", 0.95)
    document.querySelector('html').style.setProperty('--primary-095', colorData3);
    let colorData4 = hexToRgba(myVarVal || "#1650e2", 0.1)
    document.querySelector('html').style.setProperty('--primary-01', colorData4);

    // Secondary opacity

    let colorData5 = hexToRgba(myVarVal1 || "#e34216", 0.6)
    document.querySelector('html').style.setProperty('--secondary-06', colorData5);
    
}
names()