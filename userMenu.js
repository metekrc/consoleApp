const readline = require("readline");
const fs = require("fs");
const chalk = require("chalk");
const { Command } = require("commander");

const dataFile = "data.json";
const userFile = "users.json";

// JSON dosyasını okumak ve başlatmak
function loadData() {
  if (fs.existsSync(dataFile)) {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  }
  const data = {
    pool: { tokenA: 1000, tokenB: 1000, K: 1000000 },
    users: { defaultUser: { userBalance: { tokenA: 500, tokenB: 500 } } },
  };

  saveData(data);
  return data;
}

//pool verilerini JSON dosyasını kaydetmek
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let data = loadData();
let currentUser = null; // Şu anda aktif kullanıcı

const program = new Command();

program.version("1.0.0").description(chalk.cyan("Uniswap V2 DEX Simülasyonu")); // Başlangıç açıklamasını cyan yaptık

function selectUserMenu() {
  console.log(chalk.cyan("\nKullanıcı Seçim Menüsü"));
  console.log(chalk.cyan("1. Kullanıcı Seç"));
  console.log(chalk.cyan("2. Yeni Kullanıcı Oluştur"));
  console.log(chalk.cyan("3. Çıkış"));

  rl.question(chalk.cyan("Seçiminizi yapın (1-3): "), (choice) => {
    switch (choice) {
      case "1":
        selectExistingUser();
        break;
      case "2":
        createNewUser();
        break;
      case "3":
        exitProgram();
        break;
      default:
        console.log(
          chalk.red("Geçersiz seçim, lütfen 1-3 arasında bir seçenek girin."),
        );
        selectUserMenu();
        break;
    }
  });
}

function selectExistingUser() {
  const usernames = Object.keys(data.users);
  if (usernames.length === 0) {
    console.log(
      chalk.yellow(
        "Hiçbir kullanıcı bulunamadı. Yeni bir kullanıcı oluşturun.",
      ),
    );
    selectUserMenu();
    return;
  }

  console.log(chalk.cyan("\nMevcut Kullanıcılar:"));
  usernames.forEach((username, index) => {
    console.log(`${index + 1}. ${username}`);
  });

  rl.question(chalk.cyan("Kullanıcı seçin (numara): "), (num) => {
    const index = parseInt(num, 10) - 1;
    if (index >= 0 && index < usernames.length) {
      currentUser = usernames[index];
      console.log(chalk.green(`\n${currentUser} kullanıcısı seçildi.`));
      showMenu();
    } else {
      console.log(chalk.red("Geçersiz seçim."));
      selectExistingUser();
    }
  });
}

function createNewUser() {
  rl.question(chalk.yellow("Yeni kullanıcı adı girin: "), (username) => {
    if (data.users[username]) {
      console.log(chalk.red("Bu kullanıcı zaten mevcut."));
      selectUserMenu();
    } else {
      data.users[username] = {
        userBalance: { tokenA: 500, tokenB: 500 },
      };
      saveData(data);
      console.log(chalk.green(`\nYeni kullanıcı oluşturuldu: ${username}`));
      selectUserMenu();
    }
  });
}

// Başlangıç menüsünü gösterme
function showMenu() {
  console.log(
    chalk.white(`
    Ne yapmak istersiniz?
    `),
  );
  console.log(
    chalk.cyan(`
    1. Likidite Ekle
    2. Swap (Token A -> Token B veya Token B -> Token A)
    3. Havuz Durumunu Görüntüle
    4. Kullanıcı Bakiyesini Görüntüle
    5. Kullanıcı Değiştir
    6. Çıkış
    `),
  );

  rl.question(chalk.cyan("Seçiminizi yapın (1-5): "), (choice) => {
    switch (choice) {
      case "1":
        addLiquidity();
        break;
      case "2":
        swap();
        break;
      case "3":
        showPoolStatus();
        break;
      case "4":
        showUserBalance();
        break;
      case "5":
        selectUserMenu();
        break;
      case "6":
        exitProgram();
        break;
      default:
        console.log(
          chalk.red("Geçersiz seçim, lütfen 1-5 arasında bir seçenek girin."),
        );
        showMenu(); // Geçersiz seçimde menüyü tekrar gösteriyoruz
        break;
    }
  });
}

// 1. Likidite Ekleme İşlemi
function addLiquidity() {
  console.log(chalk.green("Likidite ekleme işlemi başlatıldı."));

  rl.question(chalk.yellow("TokenA miktarını giriniz: "), (amountA) => {
    rl.question(chalk.yellow("TokenB miktarını giriniz: "), (amountB) => {
      amountA = parseFloat(amountA);
      amountB = parseFloat(amountB);

      if (isNaN(amountA) || isNaN(amountB)) {
        console.log(
          chalk.red("Hatalı giriş yaptınız. Lütfen sayısal değer giriniz."),
        );
      } else {
        data.pool.tokenA += amountA;
        data.pool.tokenB += amountB;
        data.pool.K = data.pool.tokenA * data.pool.tokenB;
        console.log(
          chalk.cyan(
            `Havuz güncellendi: TokenA = ${data.pool.tokenA}, TokenB = ${data.pool.tokenB}, K = ${data.pool.K}`,
          ),
        );
        saveData(data);
      }
      showMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
    });
  });
}

// 2. Swap İşlemi
function swap() {
  console.log(chalk.green("Swap işlemi başlatıldı."));

  function askTokenType() {
    rl.question(
      chalk.yellow("Hangi token'ı takas etmek istersiniz? (A/B): "),
      (tokenType) => {
        if (tokenType !== "A" && tokenType !== "B") {
          console.log(
            chalk.red(
              'Geçersiz token türü seçimi. Lütfen "A" veya "B" giriniz.',
            ),
          );
          askTokenType(); // Hatalı girişte tekrar soruyoruz
          return;
        }
        askAmount(tokenType); // Geçerli token seçildiyse miktarı soruyoruz
      },
    );
  }

  function askAmount(tokenType) {
    rl.question(
      chalk.yellow("Takas etmek istediğiniz miktarı giriniz: "),
      (amount) => {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
          console.log(
            chalk.red(
              "Hatalı miktar girdiniz. Lütfen pozitif bir sayı giriniz.",
            ),
          );
          askAmount(tokenType); // Hatalı miktarda tekrar miktar sorulacak
          return;
        }
        processSwap(tokenType, amount); // Geçerli miktar ve token ile işlemi yapıyoruz
      },
    );
  }

  function processSwap(tokenType, amount) {
    if (tokenType === "A") {
      if (data.users[currentUser].userBalance.tokenA < amount) {
        console.log(chalk.red("Yeterli Token A bakiyeniz yok."));
      } else {
        const tokenBOut =
          data.pool.tokenB - data.pool.K / (data.pool.tokenA + amount);
        data.users[currentUser].userBalance.tokenA -= amount;
        data.users[currentUser].userBalance.tokenB += tokenBOut;
        data.pool.tokenA += amount;
        data.pool.tokenB -= tokenBOut;

        console.log(
          chalk.green(
            `Swap tamamlandı! Token A -> Token B\nKazandığınız Token B: ${tokenBOut.toFixed(2)}`,
          ),
        );
      }
    } else {
      if (data.users[currentUser].userBalance.tokenB < amount) {
        console.log(chalk.red("Yeterli Token B bakiyeniz yok."));
      } else {
        const tokenAOut =
          data.pool.tokenA - data.pool.K / (data.pool.tokenB + amount);
        data.users[currentUser].userBalance.tokenB -= amount;
        data.users[currentUser].userBalance.tokenA += tokenAOut;
        data.pool.tokenB += amount;
        data.pool.tokenA -= tokenAOut;

        console.log(
          chalk.green(
            `Swap tamamlandı! Token B -> Token A\nKazandığınız Token A: ${tokenAOut.toFixed(2)}`,
          ),
        );
      }
    }
    saveData(data);
    showMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
  }

  askTokenType(); // İlk soruyu başlatıyoruz
}

// 3. Havuz Durumunu Görüntüleme
function showPoolStatus() {
  console.log(chalk.yellow("Havuz durumu görüntüleniyor..."));
  console.log(chalk.white(`TokenA: ${data.pool.tokenA}`));
  console.log(chalk.white(`TokenB: ${data.pool.tokenB}`));
  console.log(chalk.white(`K: ${data.pool.K}`));
  showMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
}

// 4. Kullanıcı Bakiyesini Görüntüleme
function showUserBalance() {
  console.log(chalk.yellow("Kullanıcı bakiyesi görüntüleniyor..."));
  console.log(
    chalk.white(`TokenA: ${data.users[currentUser].userBalance.tokenA}`),
  );
  console.log(
    chalk.white(`TokenB: ${data.users[currentUser].userBalance.tokenB}`),
  );
  showMenu(); // İşlem tamamlandığında kısa menüyü gösteriyoruz
}

// 5. Çıkış
function exitProgram() {
  console.log(chalk.red("Çıkılıyor..."));
  rl.close();
}

// Programı başlatma
selectUserMenu(); // İlk menüyü gösteriyoruz
