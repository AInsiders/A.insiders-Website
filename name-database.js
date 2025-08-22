// Comprehensive Name Database for Identity Generator
// Organized by cultural origins and categories

const nameDatabase = {
    // MALE FIRST NAMES - 100+ unique names organized by category
    maleFirstNames: {
        // American/English Names (25 names)
        american: [
            'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
            'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
            'Kenneth', 'Kevin', 'Brian', 'George', 'Edward'
        ],
        
        // Italian Names (15 names)
        italian: [
            'Marco', 'Luca', 'Giuseppe', 'Antonio', 'Giovanni', 'Alessandro', 'Matteo', 'Andrea', 'Roberto', 'Francesco',
            'Daniele', 'Federico', 'Simone', 'Riccardo', 'Leonardo'
        ],
        
        // French Names (15 names)
        french: [
            'Pierre', 'Jean', 'Michel', 'André', 'Philippe', 'François', 'Nicolas', 'Laurent', 'David', 'Thomas',
            'Sébastien', 'Vincent', 'Alexandre', 'Guillaume', 'Raphaël'
        ],
        
        // German Names (15 names)
        german: [
            'Hans', 'Klaus', 'Wolfgang', 'Heinz', 'Günther', 'Manfred', 'Werner', 'Helmut', 'Dieter', 'Rolf',
            'Jürgen', 'Karl', 'Friedrich', 'Otto', 'Wilhelm'
        ],
        
        // Spanish Names (15 names)
        spanish: [
            'Carlos', 'Miguel', 'Javier', 'Diego', 'Fernando', 'Luis', 'Pablo', 'Sergio', 'Manuel', 'Ricardo',
            'Eduardo', 'Alberto', 'Francisco', 'Antonio', 'Rafael'
        ],
        
        // Russian Names (15 names)
        russian: [
            'Dmitri', 'Vladimir', 'Sergei', 'Ivan', 'Nikolai', 'Andrei', 'Mikhail', 'Alexei', 'Viktor', 'Yuri',
            'Boris', 'Anatoly', 'Konstantin', 'Pavel', 'Roman'
        ],

        // Chinese Names (15 names)
        chinese: [
            'Wei', 'Ming', 'Jian', 'Hao', 'Feng', 'Lei', 'Tao', 'Jun', 'Bin', 'Yong',
            'Xiang', 'Peng', 'Kai', 'Zhen', 'Rui'
        ],

        // Indian Names (15 names)
        indian: [
            'Arjun', 'Vikram', 'Rajesh', 'Amit', 'Suresh', 'Rahul', 'Deepak', 'Anand', 'Krishna', 'Vishal',
            'Prakash', 'Sunil', 'Mohan', 'Ravi', 'Sanjay'
        ],

        // Fancy/Formal Names (15 names)
        fancy: [
            'Alexander', 'Sebastian', 'Maximilian', 'Theodore', 'Augustus', 'Benedict', 'Montgomery', 'Wellington', 'Fitzgerald',
            'Archibald', 'Bartholomew', 'Cornelius', 'Demetrius', 'Valentine', 'Reginald'
        ],

        // Modern Names (15 names)
        modern: [
            'Aiden', 'Mason', 'Liam', 'Noah', 'Ethan', 'Lucas', 'Oliver', 'Elijah', 'Logan', 'Jackson',
            'Caleb', 'Jack', 'Owen', 'Dylan', 'Grayson'
        ]
    },

    // FEMALE FIRST NAMES - 100+ unique names organized by category
    femaleFirstNames: {
        // American/English Names (25 names)
        american: [
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
            'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
            'Laura', 'Emily', 'Kimberly', 'Deborah', 'Dorothy'
        ],
        
        // Italian Names (15 names)
        italian: [
            'Sofia', 'Giulia', 'Alessia', 'Martina', 'Chiara', 'Valentina', 'Francesca', 'Alice', 'Elisa', 'Camilla',
            'Beatrice', 'Giorgia', 'Vittoria', 'Aurora', 'Ludovica'
        ],
        
        // French Names (15 names)
        french: [
            'Marie', 'Sophie', 'Julie', 'Camille', 'Léa', 'Chloé', 'Manon', 'Emma', 'Lola', 'Jade',
            'Louise', 'Alice', 'Inès', 'Léonie', 'Agathe'
        ],
        
        // German Names (15 names)
        german: [
            'Anna', 'Maria', 'Helena', 'Sophie', 'Emma', 'Lea', 'Lena', 'Mia', 'Hannah', 'Emilia',
            'Lina', 'Clara', 'Luisa', 'Nora', 'Mila'
        ],
        
        // Spanish Names (15 names)
        spanish: [
            'Sofía', 'Isabella', 'Camila', 'Valentina', 'Lucía', 'María', 'Carmen', 'Elena', 'Ana', 'Claudia',
            'Adriana', 'Gabriela', 'Daniela', 'Victoria', 'Rosa'
        ],
        
        // Russian Names (15 names)
        russian: [
            'Anastasia', 'Maria', 'Anna', 'Ekaterina', 'Olga', 'Tatiana', 'Natalia', 'Elena', 'Irina', 'Svetlana',
            'Yulia', 'Larisa', 'Galina', 'Nina', 'Vera'
        ],

        // Chinese Names (15 names)
        chinese: [
            'Li', 'Mei', 'Xia', 'Yan', 'Hui', 'Jing', 'Lan', 'Min', 'Ping', 'Qing',
            'Rong', 'Shan', 'Ting', 'Wen', 'Xue'
        ],

        // Indian Names (15 names)
        indian: [
            'Priya', 'Anjali', 'Deepika', 'Kavita', 'Meera', 'Neha', 'Pooja', 'Rashmi', 'Sangeeta', 'Tanya',
            'Uma', 'Vandana', 'Zara', 'Aditi', 'Bhavana'
        ],

        // Fancy/Formal Names (15 names)
        fancy: [
            'Isabella', 'Victoria', 'Alexandria', 'Seraphina', 'Evangeline', 'Penelope', 'Arabella', 'Genevieve', 'Clementine', 'Theodora',
            'Beatrice', 'Adelaide', 'Florence', 'Rosalind', 'Vivienne'
        ],

        // Modern Names (15 names)
        modern: [
            'Ava', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
            'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Madison'
        ]
    },

    // LAST NAMES - 100+ unique names organized by category
    lastNames: {
        // American/English Surnames (25 names)
        american: [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Thomas',
            'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis',
            'Robinson', 'Walker', 'Young', 'Allen', 'King'
        ],
        
        // Italian Surnames (15 names)
        italian: [
            'Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno',
            'Galli', 'Rinaldi', 'Fontana', 'Caruso', 'Ferrara'
        ],
        
        // French Surnames (15 names)
        french: [
            'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
            'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia'
        ],
        
        // German Surnames (15 names)
        german: [
            'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
            'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'
        ],
        
        // Spanish Surnames (15 names)
        spanish: [
            'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martin',
            'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
        ],
        
        // Irish Surnames (15 names)
        irish: [
            'Murphy', 'O\'Connor', 'Walsh', 'Ryan', 'O\'Brien', 'Sullivan', 'Connor', 'O\'Neill', 'Reilly', 'Quinn',
            'Kennedy', 'Lynch', 'McCarthy', 'O\'Donnell', 'Byrne'
        ],

        // Chinese Surnames (15 names)
        chinese: [
            'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Zhou', 'Sun',
            'Zhu', 'Ma', 'Guo', 'Lin', 'He'
        ],

        // Indian Surnames (15 names)
        indian: [
            'Patel', 'Singh', 'Kumar', 'Sharma', 'Verma', 'Gupta', 'Malik', 'Khan', 'Ali', 'Hassan',
            'Ahmed', 'Rahman', 'Hussain', 'Mahmood', 'Iqbal'
        ],

        // Fancy/Formal Surnames (15 names)
        fancy: [
            'Montgomery', 'Fitzgerald', 'Wellington', 'Bartholomew', 'Archibald', 'Cornelius', 'Demetrius', 'Valentine', 'Benedict', 'Augustus',
            'Theodore', 'Maximilian', 'Sebastian', 'Alexander', 'Chamberlain'
        ],

        // Modern Surnames (15 names)
        modern: [
            'Anderson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
            'King', 'Wright', 'Scott', 'Hill', 'Green'
        ]
    },

    // Name Categories for Selection
    nameCategories: {
        firstNames: {
            'American/English': 'american',
            'Italian': 'italian',
            'French': 'french',
            'German': 'german',
            'Spanish': 'spanish',
            'Russian': 'russian',
            'Chinese': 'chinese',
            'Indian': 'indian',
            'Fancy/Formal': 'fancy',
            'Modern': 'modern',
            'Random': 'random'
        },
        lastNames: {
            'American/English': 'american',
            'Italian': 'italian',
            'French': 'french',
            'German': 'german',
            'Spanish': 'spanish',
            'Irish': 'irish',
            'Chinese': 'chinese',
            'Indian': 'indian',
            'Fancy/Formal': 'fancy',
            'Modern': 'modern',
            'Random': 'random'
        }
    },

    // Helper function to get all names from a category
    getAllNamesFromCategory: function(category, nameType) {
        if (category === 'random') {
            // Return all names from all categories
            const allNames = [];
            Object.values(this[nameType]).forEach(catNames => {
                allNames.push(...catNames);
            });
            return allNames;
        }
        return this[nameType][category] || [];
    },

    // Helper function to get a random name from a category
    getRandomNameFromCategory: function(category, nameType) {
        const names = this.getAllNamesFromCategory(category, nameType);
        if (names.length === 0) {
            console.warn(`No names found for category: ${category}, nameType: ${nameType}`);
            return 'Unknown';
        }
        return names[Math.floor(Math.random() * names.length)];
    },

    // Helper function to get all available categories
    getCategories: function(nameType) {
        return Object.keys(this.nameCategories[nameType]);
    },

    // Helper function to validate that all names are unique
    validateUniqueNames: function() {
        const allNames = new Set();
        const duplicates = [];
        
        ['maleFirstNames', 'femaleFirstNames', 'lastNames'].forEach(nameType => {
            Object.values(this[nameType]).forEach(category => {
                category.forEach(name => {
                    if (allNames.has(name)) {
                        duplicates.push(name);
                    } else {
                        allNames.add(name);
                    }
                });
            });
        });
        
        if (duplicates.length > 0) {
            console.warn('Duplicate names found:', duplicates);
            return false;
        }
        return true;
    }
};

// Validate the database on load
if (typeof window !== 'undefined') {
    nameDatabase.validateUniqueNames();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = nameDatabase;
}
