const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const { Command } = require('commander');

const dataFile = 'data.json';

// JSON dosyasını okumak ve başlatmak
function loadData() {
    if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
    return {
        pool: { tokenA: 1000, tokenB: 1000, K: 1000000 },
        userBalance: { tokenA: 500, tokenB: 500 }
    };
}

// JSON dosyasını kaydetmek
function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let data = loadData();

const program = new Command();

program
    .version('1.0.0')
    .description(chalk.cyan('Uniswap V2 DEX Simülasyonu')); // Başlangıç açıklamasını cyan yaptık

// Başlangıç menüsünü gösterme
function showMenu() {
    console.log(chalk.white(`
    Ne yapmak istersiniz?
    `))
    console.log(chalk.cyan(`
    1. Likidite Ekle
    2. Swap (Token A -> Token B veya Token B -> Token A)
    3. Havuz Durumunu Görüntüle
    4. Kullanıcı Bakiyesini Görüntüle
    5. Çıkış
    `));
    
    rl.question(chalk.cyan('Seçiminizi yapın (1-5): '), (choice) => {
        switch (choice) {
            case '1':
                addLiquidity();
                break;
            case '2':
                swap();
                break;
            case '3':
                showPoolStatus();
                break;
            case '4':
                showUserBalance();
                break;
            case '5':
                exitProgram();
                break;
            default:
                console.log(chalk.red('Geçersiz seçim, lütfen 1-5 arasında bir seçenek girin.'));
                showMenu(); // Geçersiz seçimde menüyü tekrar gösteriyoruz
                break;
        }
    });
}

// Kısa menüyü gösterme (İşlem sonrası)
function showShortMenu() {
    console.log(chalk.cyan(`
    Ne yapmak istersiniz?
    1. Menüyü göster
    2. Çıkış
    `));
    
    rl.question(chalk.cyan('Seçiminizi yapın (1-2): '), (choice) => {
        if (choice === '1') {
            showMenu(); // Menüye geri dönüyoruz
        } else if (choice === '2') {
            exitProgram(); // Çıkıyoruz
        } else {
            console.log(chalk.red('Geçersiz seçim, lütfen 1 veya 2 girin.'));
            showShortMenu(); // Hatalı seçimde tekrar soruyoruz
        }
    });
}

// 1. Likidite Ekleme İşlemi
function addLiquidity() {
    console.log(chalk.green('Likidite ekleme işlemi başlatıldı.'));
    
    rl.question(chalk.yellow('TokenA miktarını giriniz: '), (amountA) => {
        rl.question(chalk.yellow('TokenB miktarını giriniz: '), (amountB) => {
            amountA = parseFloat(amountA);
            amountB = parseFloat(amountB);
            
            if (isNaN(amountA) || isNaN(amountB)) {
                console.log(chalk.red('Hatalı giriş yaptınız. Lütfen sayısal değer giriniz.'));
            } else {
                data.pool.tokenA += amountA;
                data.pool.tokenB += amountB;
                data.pool.K = data.pool.tokenA * data.pool.tokenB;
                console.log(chalk.cyan(`Havuz güncellendi: TokenA = ${data.pool.tokenA}, TokenB = ${data.pool.tokenB}, K = ${data.pool.K}`));
                saveData(data);
            }
            showShortMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
        });
    });
}

// 2. Swap İşlemi
function swap() {
    console.log(chalk.green('Swap işlemi başlatıldı.'));
    
    function askTokenType() {
        rl.question(chalk.yellow('Hangi token\'ı takas etmek istersiniz? (A/B): '), (tokenType) => {
            if (tokenType !== 'A' && tokenType !== 'B') {
                console.log(chalk.red('Geçersiz token türü seçimi. Lütfen "A" veya "B" giriniz.'));
                askTokenType(); // Hatalı girişte tekrar soruyoruz
                return;
            }
            askAmount(tokenType); // Geçerli token seçildiyse miktarı soruyoruz
        });
    }

    function askAmount(tokenType) {
        rl.question(chalk.yellow('Takas etmek istediğiniz miktarı giriniz: '), (amount) => {
            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0) {
                console.log(chalk.red('Hatalı miktar girdiniz. Lütfen pozitif bir sayı giriniz.'));
                askAmount(tokenType); // Hatalı miktarda tekrar miktar sorulacak
                return;
            }
            processSwap(tokenType, amount); // Geçerli miktar ve token ile işlemi yapıyoruz
        });
    }

    function processSwap(tokenType, amount) {
        if (tokenType === 'A') {
            if (data.userBalance.tokenA < amount) {
                console.log(chalk.red('Yeterli Token A bakiyeniz yok.'));
            } else {
                const tokenBOut = data.pool.tokenB - (data.pool.K / (data.pool.tokenA + amount));
                data.userBalance.tokenA -= amount;
                data.userBalance.tokenB += tokenBOut;
                data.pool.tokenA += amount;
                data.pool.tokenB -= tokenBOut;

                console.log(chalk.green(`Swap tamamlandı! Token A -> Token B\nKazandığınız Token B: ${tokenBOut.toFixed(2)}`));
            }
        } else {
            if (data.userBalance.tokenB < amount) {
                console.log(chalk.red('Yeterli Token B bakiyeniz yok.'));
            } else {
                const tokenAOut = data.pool.tokenA - (data.pool.K / (data.pool.tokenB + amount));
                data.userBalance.tokenB -= amount;
                data.userBalance.tokenA += tokenAOut;
                data.pool.tokenB += amount;
                data.pool.tokenA -= tokenAOut;

                console.log(chalk.green(`Swap tamamlandı! Token B -> Token A\nKazandığınız Token A: ${tokenAOut.toFixed(2)}`));
            }
        }
        saveData(data);
        showShortMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
    }

    askTokenType(); // İlk soruyu başlatıyoruz
}

// 3. Havuz Durumunu Görüntüleme
function showPoolStatus() {
    console.log(chalk.yellow('Havuz durumu görüntüleniyor...'));
    console.log(chalk.white(`TokenA: ${data.pool.tokenA}`));
    console.log(chalk.white(`TokenB: ${data.pool.tokenB}`));
    console.log(chalk.white(`K: ${data.pool.K}`));
    showShortMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
}

// 4. Kullanıcı Bakiyesini Görüntüleme
function showUserBalance() {
    console.log(chalk.yellow('Kullanıcı bakiyesi görüntüleniyor...'));
    console.log(chalk.white(`TokenA: ${data.userBalance.tokenA}`));
    console.log(chalk.white(`TokenB: ${data.userBalance.tokenB}`));
    showShortMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
}

// 5. Çıkış
function exitProgram() {
    console.log(chalk.red('Çıkılıyor...'));
    rl.close();
}

// Programı başlatma
showMenu(); // İlk menüyü gösteriyoruz
