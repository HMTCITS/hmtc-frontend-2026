'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';

const GRID_ROWS = 12;
const GRID_COLS = 12;
const GRID_CELLS = GRID_ROWS * GRID_COLS;

// gridIndices: [
//     0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,
//    12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,
//    24,  25,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,
//    36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,
//    48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  58,  59,
//    60,  61,  62,  63,  64,  65,  66,  67,  68,  69,  70,  71,
//    72,  73,  74,  75,  76,  77,  78,  79,  80,  81,  82,  83,
//    84,  85,  86,  87,  88,  89,  90,  91,  92,  93,  94,  95,
//    96,  97,  98,  99, 100, 101, 102, 103, 104, 105, 106, 107,
//   108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
//   120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
//   132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143
// ]

type Person = {
  name: string;
  role: string;
  ig: string;
  gridIndex?: number;
  gridIndices?: number[];
};

type Bureau = {
  id: string;
  label: string;
  photo: string;
  caption: string;
  people: Person[];
};

type Department = {
  id: string;
  label: string;
  short: string;
  bureaus: Bureau[];
};

type Slide = Bureau & {
  deptId: string;
  deptLabel: string;
  deptShort: string;
};

const HMTC_DEPARTMENTS: Department[] = [
  {
    id: 'head-hmtc',
    label: 'Head Of HMTC',
    short: 'Head',
    bureaus: [
      {
        id: 'head-hmtc-bureau',
        label: 'Head Of HMTC',
        photo: '/images/reveal-kabinet/Kahima.png',
        caption: 'Head Of HMTC',
        people: [
          {
            name: 'Agym Kamil Ramadhan',
            role: 'Head Of HMTC',
            ig: 'kmlr28',
          },
        ],
      },
    ],
  },

  {
    id: 'general-secretary-relation',
    label: 'General Secretary of Relation',
    short: 'Relation',
    bureaus: [
      {
        id: 'gs-relation-bureau',
        label: 'General Secretary of Relation',
        photo: '/images/reveal-kabinet/Sekjen Relasi.png',
        caption: 'General Secretary of Relation',
        people: [
          {
            name: 'Abimanyu Danendra Andarfebano',
            role: 'General Secretary of Relation',
            ig: 'abimanyudans',
          },
        ],
      },
    ],
  },

  {
    id: 'general-secretary-human-resource',
    label: 'General Secretary of Human Resource',
    short: 'HR',
    bureaus: [
      {
        id: 'gs-human-resource-bureau',
        label: 'General Secretary of Human Resource',
        photo: '/images/reveal-kabinet/Sekjen Pengembangan.png',
        caption: 'General Secretary of Human Resource',
        people: [
          {
            name: 'Muiz Surya Fata',
            role: 'General Secretary of Human Resource',
            ig: 'muiz_fata',
          },
        ],
      },
    ],
  },

  {
    id: 'general-secretary-administration',
    label: 'General Secretary of Administration',
    short: 'Administration',
    bureaus: [
      {
        id: 'gsa-admin1',
        label: 'General Secretary of Administration 1',
        photo: '/images/reveal-kabinet/Adminstrasi1.png',
        caption: 'General Secretary of Administration 1',
        people: [
          {
            name: 'Thalita Aika Rahmani',
            role: 'General Secretary of Administration 1',
            ig: 'aikathata',
          },
        ],
      },
      {
        id: 'gsa-admin2',
        label: 'General Secretary of Administration 2',
        photo: '/images/reveal-kabinet/Adminstrasi2.png',
        caption: 'General Secretary of Administration 2',
        people: [
          {
            name: 'Adelia Tanalina Yumna',
            role: 'General Secretary of Administration 2',
            ig: 'adeliatanalina',
          },
        ],
      },
    ],
  },

  {
    id: 'general-secretary-finance',
    label: 'General Secretary of Finance',
    short: 'Finance',
    bureaus: [
      {
        id: 'gsf-1',
        label: 'General Secretary of Finance 1',
        photo: '/images/reveal-kabinet/Keuangan1.png',
        caption: 'General Secretary of Finance 1',
        people: [
          {
            name: 'Syahri Banun',
            role: 'General Secretary of Finance 1',
            ig: 'syahribanunn',
          },
        ],
      },
      {
        id: 'gsf-2',
        label: 'General Secretary of Finance 2',
        photo: '/images/reveal-kabinet/Keuangan2.png',
        caption: 'General Secretary of Finance 2',
        people: [
          {
            name: 'Nasyita Larasati Ertyananda',
            role: 'General Secretary of Finance 2',
            ig: 'nasyitalarasatie',
          },
        ],
      },
    ],
  },

  {
    id: 'general-secretary-human-capital',
    label: 'General Secretary of Human Capital',
    short: 'Human Capital',
    bureaus: [
      {
        id: 'gshc-main',
        label: 'General Secretary of Human Capital',
        photo: '/images/reveal-kabinet/Personalia1.png',
        caption: 'General Secretary of Human Capital',
        people: [
          {
            name: 'Bunga Melati Putri Luqman',
            role: 'General Secretary of Human Capital',
            ig: 'melatiluqman',
          },
        ],
      },
      {
        id: 'gshc-assistance1',
        label: 'Human Capital Assistant',
        photo: '/images/reveal-kabinet/Personalia2.png',
        caption: 'Human Capital Assistant',
        people: [
          {
            name: 'Najma Lail Arazy',
            role: 'Human Capital Assistant',
            ig: 'najmarra',
          },
          {
            name: 'Via Hana Nurma Putri',
            role: 'Human Capital Assistant',
            ig: 'hanaavia',
          },
          {
            name: 'Clive Kenaz Fausto Sulastomo',
            role: 'Human Capital Assistant',
            ig: 'akumaukuliah',
          },
        ],
      },
      {
        id: 'gshc-assistance2',
        label: 'Human Capital Assistant',
        photo: '/images/reveal-kabinet/Personalia3.png',
        caption: 'Human Capital Assistant',
        people: [
          {
            name: 'Belvany Virginia Kenetta Setiawan',
            role: 'Human Capital Assistant',
            ig: 'belvanyyy',
            gridIndices: [
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
          {
            name: 'Mikail Ibrahim Hakim',
            role: 'Human Capital Assistant',
            ig: 'mikailibraa',
            gridIndices: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
              12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
              24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
              48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
            ]
          },
          {
            name: 'Severinus Fabian Tanuwidjaja',
            role: 'Human Capital Assistant',
            ig: 'severinus_fabian',
            gridIndices: [
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
        ],
      },
    ],
  },

  {
    id: 'student-talent-interest',
    label: 'Student Talent and Interest',
    short: 'STI',
    bureaus: [
      {
        id: 'sti-head',
        label: 'Head of Student Talent and Interest',
        photo: '/images/reveal-kabinet/STI1.png',
        caption: 'Head of Student Talent and Interest',
        people: [
          {
            name: 'Ferdian Ardra Hafizhan',
            role: 'Head of Student Talent and Interest',
            ig: 'ferdianardr',
          },
        ],
      },
      {
        id: 'sti-secretary',
        label: 'Secretary of Student Talent and Interest',
        photo: '/images/reveal-kabinet/STI2.png',
        caption: 'Secretary of Student Talent and Interest',
        people: [
          {
            name: 'Ary Pasya Fernanda',
            role: 'Secretary of Student Talent and Interest',
            ig: 'pasya__f',
          },
        ],
      },
      {
        id: 'sti-community-head',
        label: 'Head & Vice Head of Community Bureau',
        photo: '/images/reveal-kabinet/STI3.png',
        caption: 'Head & Vice Head of Community Bureau',
        people: [
          {
            name: 'Muhammad Hilbran Akmal Abrar',
            role: 'Head of Community Bureau',
            ig: 'hlbrnakml',
          },
          {
            name: 'Mochamad Ramadhan Aditya Rachman',
            role: 'Vice Head of Community Bureau',
            ig: 'rmdhnaditya08',
          },
        ],
      },
      {
        id: 'sti-event-head',
        label: 'Head & Vice Head of Event Bureau',
        photo: '/images/reveal-kabinet/STI4.png',
        caption: 'Head & Vice Head of Event Bureau',
        people: [
          {
            name: 'Hosea Felix Sanjaya',
            role: 'Head of Event Bureau',
            ig: 'hoseafelix_',
            gridIndices: [
              6, 7, 18, 19, 8, 9, 20, 21, 10, 11, 22, 23,
              30, 31, 42, 43, 32, 33, 44, 45, 34, 35, 46, 47,
              54, 55, 66, 67, 56, 57, 68, 69, 58, 59, 70, 71,
              78, 79, 90, 91, 80, 81, 92, 93, 82, 83, 94, 95,
              102, 103, 114, 115, 104, 105, 116, 117, 106, 107, 118, 119,
              126, 127, 138, 139, 128, 129, 140, 141, 130, 131, 142, 143,
            ]
          },
          {
            name: 'Lyonel Oliver Dwiputra',
            role: 'Vice Head of Event Bureau',
            ig: 'leonoliver1911',
            gridIndices: [
              0, 1, 12, 13, 2, 3, 14, 15, 4, 5, 16, 17,
              24, 25, 36, 37, 26, 27, 38, 39, 28, 29, 40, 41,
              48, 49, 60, 61, 50, 51, 62, 63, 52, 53, 64, 65,
              72, 73, 84, 85, 74, 75, 86, 87, 76, 77, 88, 89,
              96, 97, 108, 109, 98, 99, 110, 111, 100, 101, 112, 113,
              120, 121, 132, 133, 122, 123, 134, 135, 124, 125, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'sti-community-staff',
        label: 'Staff of Student Talent Interest Department',
        photo: '/images/reveal-kabinet/STI5.png',
        caption: 'Staff of Student Talent Interest Department',
        people: [
          {
            name: 'Farras Nizar',
            role: 'Staff of Student Talent Interest Department',
            ig: 'farras.nyzr',
          },
          {
            name: 'Razan Widya Reswara',
            role: 'Staff of Student Talent Interest Department',
            ig: 'razanvvr',
          },
          {
            name: 'Dafa Kumara Sahasika',
            role: 'Staff of Student Talent Interest Department',
            ig: 'kumaradaf',
          },
          {
            name: 'Raihan Rasyid Ramadhan',
            role: 'Staff of Student Talent Interest Department',
            ig: 'raiyhan_rr',
          },
        ],
      },
      {
        id: 'sti-event-staff',
        label: 'Staff of Student Talent Interest Department',
        photo: '/images/reveal-kabinet/STI6.png',
        caption: 'Staff of Student Talent Interest Department',
        people: [
          {
            name: 'Christian Mikaxelo',
            role: 'Staff of Student Talent Interest Department',
            ig: 'axelprb_',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
            ]
          },
          {
            name: 'Mirza Rifai Dhiaurrahman',
            role: 'Staff of Student Talent Interest Department',
            ig: 'rifai.dh',
            gridIndices: [
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
          {
            name: 'Ahmad Loka Arziki',
            role: 'Staff of Student Talent Interest Department',
            ig: 'ahmdlka',
            gridIndices: [
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Farrel Jevanius Tjandra',
            role: 'Staff of Student Talent Interest Department',
            ig: 'farreljevanius',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
            ]
          },
        ],
      },
    ],
  },

  {
    id: 'external-affairs',
    label: 'External Affairs',
    short: 'EA',
    bureaus: [
      {
        id: 'ea-head',
        label: 'Head of External Affairs',
        photo: '/images/reveal-kabinet/EA1.png',
        caption: 'Head of External Affairs',
        people: [
          {
            name: 'Rafie Zaidan Umara',
            role: 'Head of External Affairs',
            ig: 'rafiezdnn',
          },
        ],
      },
      {
        id: 'ea-secretary',
        label: 'Secretary of External Affairs',
        photo: '/images/reveal-kabinet/EA2.png',
        caption: 'Secretary of External Affairs',
        people: [
          {
            name: 'Rahma Sakinah',
            role: 'Secretary of External Affairs',
            ig: 'rahmasakinah_',
          },
        ],
      },
      {
        id: 'ea-head-bureau',
        label: 'Head of Bureaus',
        photo: '/images/reveal-kabinet/EA3.png',
        caption: 'Head of Bureaus',
        people: [
          {
            name: 'Raynald Ramadhani Fachriansyah',
            role: 'Head of External Bureau',
            ig: 'raynaldramadhani',
            gridIndices: [
              0, 1, 12, 13, 2, 3, 14, 15, 4, 5, 16, 17,
              6, 7, 18, 19, 8, 9, 20, 21, 10, 11, 22, 23,
              24, 25, 36, 37, 26, 27, 38, 39, 28, 29, 40, 41,
              30, 31, 42, 43, 32, 33, 44, 45, 34, 35, 46, 47,
            ]
          },
          {
            name: 'Ayesha Nayla Satrio',
            role: 'Head of Alumni Bureau',
            ig: 'ayeshasatrio',
            gridIndices: [
              48, 49, 60, 61, 50, 51, 62, 63, 52, 53, 64, 65,
              54, 55, 66, 67, 56, 57, 68, 69, 58, 59, 70, 71,
              72, 73, 84, 85, 74, 75, 86, 87, 76, 77, 88, 89,
              78, 79, 90, 91, 80, 81, 92, 93, 82, 83, 94, 95,
            ]
          },
          {
            name: 'Safa Mashita',
            role: 'Head of Internal Bureau',
            ig: 'safashita',
            gridIndices: [
              96, 97, 108, 109, 98, 99, 110, 111, 100, 101, 112, 113,
              102, 103, 114, 115, 104, 105, 116, 117, 106, 107, 118, 119,
              120, 121, 132, 133, 122, 123, 134, 135, 124, 125, 136, 137,
              126, 127, 138, 139, 128, 129, 140, 141, 130, 131, 142, 143,
            ]
          },
        ],
      },
      {
        id: 'ea-external-staff',
        label: 'Staff of External Bureau',
        photo: '/images/reveal-kabinet/EA4.png',
        caption: 'Staff of External Bureau',
        people: [
          {
            name: 'Valentino Mausal Sinaga',
            role: 'Staff of External Bureau',
            ig: 'valntsng_',
            gridIndices: [
              0, 1, 2, 3,
              12, 13, 14, 15,
              24, 25, 26, 27,
              36, 37, 38, 39,
              48, 49, 50, 51,
              60, 61, 62, 63,
              72, 73, 74, 75,
              84, 85, 86, 87,
              96, 97, 98, 99,
              108, 109, 110, 111,
              120, 121, 122, 123,
              132, 133, 134, 135,
            ]
          },
          {
            name: 'Ibrahim Ferel',
            role: 'Staff of External Bureau',
            ig: 'ibrahimferel',
            gridIndices: [
              76, 77, 88, 89, 78, 79, 90, 91,
              100, 101, 112, 113, 102, 103, 114, 115,
              124, 125, 136, 137, 126, 127, 138, 139,
            ]
          },
          {
            name: 'Afarrel Febryan Ghiffari Putra Andy',
            role: 'Staff of External Bureau',
            ig: 'farelfebryann',
            gridIndices: [
              4, 5, 16, 17, 6, 7, 18, 19,
              28, 29, 40, 41, 30, 31, 42, 43,
              52, 53, 64, 65, 54, 55, 66, 67,
            ]
          },
          {
            name: 'Brilian Kurniawan Prasisto',
            role: 'Staff of External Bureau',
            ig: 'brilian_kurniawan',
            gridIndices: [
              8, 9, 20, 21, 10, 11, 22, 23,
              32, 33, 44, 45, 34, 35, 46, 47,
              56, 57, 68, 69, 58, 59, 70, 71,
              80, 81, 92, 93, 82, 83, 94, 95,
              104, 105, 116, 117, 106, 107, 118, 119,
              128, 129, 140, 141, 130, 131, 142, 143,
            ]
          },
        ],
      },
      {
        id: 'ea-internal-staff',
        label: 'Staff of Internal Bureau',
        photo: '/images/reveal-kabinet/EA6.png',
        caption: 'Staff of Internal Bureau',
        people: [
          {
            name: 'Hisyam Syafa Raditya',
            role: 'Staff of Internal Bureau',
            ig: 'hisyamssyr_',
          },
          {
            name: 'Gilbran Mahdavikia Raja',
            role: 'Staff of Internal Bureau',
            ig: 'gbrn.mhd',
          },
        ],
      },
      {
        id: 'ea-alumni-staff',
        label: 'Staff of Alumni Bureau',
        photo: '/images/reveal-kabinet/EA5.png',
        caption: 'Staff of Alumni Bureau',
        people: [
          {
            name: 'Malvin Jonathan',
            role: 'Staff of Alumni Bureau',
            ig: 'joweirdthaan',
          },
          {
            name: 'Jason Kumarkono',
            role: 'Staff of Alumni Bureau',
            ig: 'jasonkmrrkn',
          },
        ],
      },
    ],
  },

  {
    id: 'student-social-development',
    label: 'Student Social Development',
    short: 'SSD',
    bureaus: [
      {
        id: 'ssd-head',
        label: 'Head of Student Social Development',
        photo: '/images/reveal-kabinet/SSD1.png',
        caption: 'Head of Student Social Development',
        people: [
          {
            name: 'Amelia Nova Safitri',
            role: 'Head of Student Social Development',
            ig: 'amelia_nova_s',
          },
        ],
      },
      {
        id: 'ssd-secretary',
        label: 'Secretary of Student Social Development',
        photo: '/images/reveal-kabinet/SSD2.png',
        caption: 'Secretary of Student Social Development',
        people: [
          {
            name: 'Devina Balqis Aurora',
            role: 'Secretary of Student Social Development',
            ig: 'devinabalqs',
          },
        ],
      },
      {
        id: 'ssd-student-dev-head',
        label: 'Head & Vice Head of Student Development Bureau',
        photo: '/images/reveal-kabinet/SSD3.png',
        caption: 'Head & Vice Head of Student Development Bureau',
        people: [
          {
            name: 'Maulana Akbar',
            role: 'Head of Student Development Bureau',
            ig: 'maulnakbr_',
          },
          {
            name: 'Abdullah Sultan Barizy',
            role: 'Vice Head of Student Development Bureau',
            ig: 'sultanbarizy',
          },
        ],
      },
      {
        id: 'ssd-social-dev-head',
        label: 'Head & Vice Head of Social Development Bureau',
        photo: '/images/reveal-kabinet/SSD4.png',
        caption: 'Head & Vice Head of Social Development Bureau',
        people: [
          {
            name: 'Muhammad Risyad Himawan Putra',
            role: 'Head of Social Development Bureau',
            ig: 'rlsyad',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Ryan Marvin Sirait',
            role: 'Vice Head of Social Development Bureau',
            ig: 'ryan_mv.s',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'ssd-student-dev-staff',
        label: 'Staff of Student Social Development Department',
        photo: '/images/reveal-kabinet/SSD5.png',
        caption: 'Staff of Student Social Development Department',
        people: [
          {
            name: 'Kinanti Ayu Caesandria',
            role: 'Staff of Student Social Development Department',
            ig: 'kinanayuc',
          },
          {
            name: 'Berwyn Rafif Alvaro',
            role: 'Staff of Student Social Development Department',
            ig: 'brrr_winn',
          },
        ],
      },
      {
        id: 'ssd-social-dev-staff',
        label: 'Staff of Student Social Development Department',
        photo: '/images/reveal-kabinet/SSD6.png',
        caption: 'Staff of Student Social Development Department',
        people: [
          {
            name: 'Nashwa Aulia Putri Diansyah',
            role: 'Staff of Student Social Development Department',
            ig: 'nanaapid',
          },
          {
            name: 'Palpal Yalmialam Tarminto',
            role: 'Staff of Student Social Development Department',
            ig: 'laplap.y',
          },
          {
            name: 'A. Wildan Kevin Assyauqi',
            role: 'Staff of Student Social Development Department',
            ig: 'wildankev',
          },
        ],
      },
    ],
  },

  {
    id: 'internal-affairs',
    label: 'Internal Affairs',
    short: 'IA',
    bureaus: [
      {
        id: 'ia-head',
        label: 'Head of Internal Affairs',
        photo: '/images/reveal-kabinet/IA1.png',
        caption: 'Head of Internal Affairs',
        people: [
          {
            name: 'Nona Auliya Wijaya',
            role: 'Head of Internal Affairs',
            ig: 'noonaauliya',
          },
        ],
      },
      {
        id: 'ia-secretary',
        label: 'Secretary of Internal Affairs',
        photo: '/images/reveal-kabinet/IA2.png',
        caption: 'Secretary of Internal Affairs',
        people: [
          {
            name: 'Lucky Himawan Prasetya',
            role: 'Secretary of Internal Affairs',
            ig: 'lcky_hmwn',
          },
        ],
      },
      {
        id: 'ia-c-head',
        label: 'Head & Vice Head of C Bureau',
        photo: '/images/reveal-kabinet/IA3.png',
        caption: 'Head & Vice Head of C Bureau',
        people: [
          {
            name: 'Elraffa Abhinaya',
            role: 'Head of C Bureau',
            ig: 'aelraffa',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Dzikrina Hidayani Martin',
            role: 'Vice Head of C Bureau',
            ig: 'dziimartin',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'ia-family-head',
        label: 'Head & Vice Head of Family Affairs Bureau',
        photo: '/images/reveal-kabinet/IA4.png',
        caption: 'Head & Vice Head of Family Affairs Bureau',
        people: [
          {
            name: 'Mufrih Fakhir',
            role: 'Head of Family Affairs Bureau',
            ig: 'mfrihhh',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Rayhan Aurelia Pramana Rijal',
            role: 'Vice Head of Family Affairs Bureau',
            ig: 'rhnaazz',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'ia-articster-staff',
        label: 'Staff of Articster Bureau',
        photo: '/images/reveal-kabinet/IA5.png',
        caption: 'Staff of Articster Bureau',
        people: [
          {
            name: 'Muhammad Adi Anugerah Arrahman',
            role: 'Head of Articster Bureau',
            ig: 'arrahmannugi',
            gridIndices: [
              4, 5, 6, 7,
              16, 17, 18, 19,
              28, 29, 30, 31,
              40, 41, 42, 43,
              52, 53, 54, 55,
              64, 65, 66, 67,
              76, 77, 78, 79,
              88, 89, 90, 91,
              100, 101, 102, 103,
              112, 113, 114, 115,
              124, 125, 126, 127,
              136, 137, 138, 139,
            ]
          },
          {
            name: 'Alif Muflih Jauhary',
            role: 'Staff of Articster Bureau',
            ig: 'alifmfarday_',
            gridIndices: [
              0, 1, 2, 3,
              12, 13, 14, 15,
              24, 25, 26, 27,
              36, 37, 38, 39,
              48, 49, 50, 51,
              60, 61, 62, 63,
              72, 73, 74, 75,
              84, 85, 86, 87,
              96, 97, 98, 99,
              108, 109, 110, 111,
              120, 121, 122, 123,
              132, 133, 134, 135,
            ]
          },
          {
            name: 'Dwinanda Rakhish Baley',
            role: 'Staff of Articster Bureau',
            ig: 'nanda_baley',
            gridIndices: [
              8, 9, 10, 11,
              20, 21, 22, 23,
              32, 33, 34, 35,
              44, 45, 46, 47,
              56, 57, 58, 59,
              68, 69, 70, 71,
              80, 81, 82, 83,
              92, 93, 94, 95,
              104, 105, 106, 107,
              116, 117, 118, 119,
              128, 129, 130, 131,
              140, 141, 142, 143
            ]
          },
        ],
      },
      {
        id: 'ia-c-staff',
        label: 'Staff of C Bureau',
        photo: '/images/reveal-kabinet/IA6.png',
        caption: 'Staff of C Bureau',
        people: [
          {
            name: 'Mochammad Irfan Sandy',
            role: 'Staff of C Bureau',
            ig: 'irfansandy',
            gridIndices: [
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
          {
            name: 'Danendra Nayottama Hadi',
            role: 'Staff of C Bureau',
            ig: 'danennh',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
            ]
          },
          {
            name: 'Fayza Lathifah Humam',
            role: 'Staff of C Bureau',
            ig: 'lathifayz',
            gridIndices: [
              6, 7, 18, 19, 8, 9, 20, 21, 10, 11, 22, 23,
              30, 31, 42, 43, 32, 33, 44, 45, 34, 35, 46, 47,
              54, 55, 66, 67, 56, 57, 68, 69, 58, 59, 70, 71,
              78, 79, 90, 91, 80, 81, 92, 93, 82, 83, 94, 95,
              102, 103, 114, 115, 104, 105, 116, 117, 106, 107, 118, 119,
              126, 127, 138, 139, 128, 129, 140, 141, 130, 131, 142, 143,
            ]
          },
        ],
      },
      {
        id: 'ia-family-staff',
        label: 'Staff of Family Affairs Bureau',
        photo: '/images/reveal-kabinet/IA7.png',
        caption: 'Staff of Family Affairs Bureau',
        people: [
          {
            name: 'Kadek Andra Wikanjaya Putra',
            role: 'Staff of Family Affairs Bureau',
            ig: 'andrawpz',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
            ]
          },
          {
            name: 'Erica Triana Widyastuti',
            role: 'Staff of Family Affairs Bureau',
            ig: 'erica.dys',
            gridIndices: [
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
          {
            name: 'Embun Nabila Rasendriya Az Zahra',
            role: 'Staff of Family Affairs Bureau',
            ig: 'embunabila',
            gridIndices: [
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Muh. Aqil Alqadri Syahid',
            role: 'Staff of Family Affairs Bureau',
            ig: 'aqil.str',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
            ]
          },
        ],
      },
    ],
  },

  {
    id: 'creative-media-information',
    label: 'Creative Media Information',
    short: 'CMI',
    bureaus: [
      {
        id: 'cmi-head',
        label: 'Head of Creative Media Information',
        photo: '/images/reveal-kabinet/CMI1.png',
        caption: 'Head of Creative Media Information',
        people: [
          {
            name: 'Cindy Revalia',
            role: 'Head of Creative Media Information',
            ig: 'cinn.vlia',
          },
        ],
      },
      {
        id: 'cmi-secretary',
        label: 'Secretary of Creative Media Information',
        photo: '/images/reveal-kabinet/CMI2.png',
        caption: 'Secretary of Creative Media Information',
        people: [
          {
            name: 'Fazle Mawla Wahyuhanda',
            role: 'Secretary of Creative Media Information',
            ig: 'fazlemwla_',
          },
        ],
      },
      {
        id: 'cmi-creative-design-head',
        label: 'Head & Vice Head of Creative Design Bureau',
        photo: '/images/reveal-kabinet/CMI3.png',
        caption: 'Head & Vice Head of Creative Design Bureau',
        people: [
          {
            name: 'Siti Zahra Ananda Kurniawan',
            role: 'Head of Creative Design Bureau',
            ig: 'szahraak_',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Naufal Fadhlil Wafi',
            role: 'Vice Head of Creative Design Bureau',
            ig: 'naufadlil',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'cmi-media-production-head',
        label: 'Head & Vice Head of Media Production Bureau',
        photo: '/images/reveal-kabinet/CMI4.png',
        caption: 'Head & Vice Head of Media Production Bureau',
        people: [
          {
            name: 'Danny Rachmadian Yusuf Satryatama',
            role: 'Head of Media Production Bureau',
            ig: 'd4nzk',
            gridIndices: [
              72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
              84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
              96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107,
              108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
              120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
              132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Muhammad Farrel Fathin Wibowo',
            role: 'Vice Head of Media Production Bureau',
            ig: '_farfat',
            gridIndices: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
              12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
              24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
              48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
              60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
            ]
          },
        ],
      },
      {
        id: 'cmi-social-media-head',
        label: 'Head & Vice Head of Social Media Specialist Bureau',
        photo: '/images/reveal-kabinet/CMI5.png',
        caption: 'Head & Vice Head of Social Media Specialist Bureau',
        people: [
          {
            name: 'Zahra Fidela Ramadhiani Tjahjono',
            role: 'Head of Social Media Specialist Bureau',
            ig: 'zahra_fidela',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Kagendra Amadeo Reynara Pratista',
            role: 'Vice Head of Social Media Specialist Bureau',
            ig: 'reynr_',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'cmi-itdev-head',
        label: 'Head & Vice Head of ITDev Bureau',
        photo: '/images/reveal-kabinet/CMI6.png',
        caption: 'Head & Vice Head of ITDev Bureau',
        people: [
          {
            name: 'Muhammad Zufar Al Hafidz',
            role: 'Head of ITDev Bureau',
            ig: '_faralha',
          },
          {
            name: 'Geraldo Benjamin Nainggolan',
            role: 'Vice Head of ITDev Bureau',
            ig: 'aldoger_bn',
          },
        ],
      },
      {
        id: 'cmi-creative-design-staff',
        label: 'Staff of Creative Design Bureau',
        photo: '/images/reveal-kabinet/CMI7.png',
        caption: 'Staff of Creative Design Bureau',
        people: [
          {
            name: 'Rasya Nur Aqilla',
            role: 'Staff of Creative Design Bureau',
            ig: 'rssyanur',
            gridIndices: [
              0, 1, 2, 3,
              12, 13, 14, 15,
              24, 25, 26, 27,
              36, 37, 38, 39,
              48, 49, 50, 51,
              60, 61, 62, 63,
              72, 73, 74, 75,
              84, 85, 86, 87,
              96, 97, 98, 99,
              108, 109, 110, 111,
              120, 121, 122, 123,
              132, 133, 134, 135,
            ]
          },
          {
            name: 'Fathiya Nayla Husna Wibowo',
            role: 'Staff of Creative Design Bureau',
            ig: 'husnaylaa',
            gridIndices: [
              4, 5, 6, 7,
              16, 17, 18, 19,
              28, 29, 30, 31,
              40, 41, 42, 43,
              52, 53, 54, 55,
              64, 65, 66, 67,
            ]
          },
          {
            name: 'Muhammad Zaki Alfikri',
            role: 'Staff of Creative Design Bureau',
            ig: 'zakialfikri._',
            gridIndices: [
              76, 77, 78, 79,
              88, 89, 90, 91,
              100, 101, 102, 103,
              112, 113, 114, 115,
              124, 125, 126, 127,
              136, 137, 138, 139,
            ]
          },
          {
            name: 'Rafi Aqila Maulana',
            role: 'Staff of Creative Design Bureau',
            ig: 'rafee.aqeela',
            gridIndices: [
              8, 9, 10, 11,
              20, 21, 22, 23,
              32, 33, 34, 35,
              44, 45, 46, 47,
              56, 57, 58, 59,
              68, 69, 70, 71,
              80, 81, 82, 83,
              92, 93, 94, 95,
              104, 105, 106, 107,
              116, 117, 118, 119,
              128, 129, 130, 131,
              140, 141, 142, 143
            ]
          },
        ],
      },
      {
        id: 'cmi-media-production-staff',
        label: 'Staff of Media Production Bureau',
        photo: '/images/reveal-kabinet/CMI8.png',
        caption: 'Staff of Media Production Bureau',
        people: [
          {
            name: 'Farras Abdurrazaq Ar-Rasyid',
            role: 'Staff of Media Production Bureau',
            ig: 'farras_2a',
          },
          {
            name: 'Liem, Alfred Haryanto',
            role: 'Staff of Media Production Bureau',
            ig: 'alfred.haryanto',
          },
        ],
      },
      {
        id: 'cmi-social-media-staff',
        label: 'Staff of Social Media Specialist Bureau',
        photo: '/images/reveal-kabinet/CMI9.png',
        caption: 'Staff of Social Media Specialist Bureau',
        people: [
          {
            name: 'Tuti Purwaningsih',
            role: 'Staff of Social Media Specialist Bureau',
            ig: '_m00nlqghtz',
          },
          {
            name: 'Shabrina Sarayati',
            role: 'Staff of Social Media Specialist Bureau',
            ig: 'shabrinassr',
          },
        ],
      },
      {
        id: 'cmi-itdev-staff',
        label: 'Staff of ITDev Bureau',
        photo: '/images/reveal-kabinet/CMI10.png',
        caption: 'Staff of ITDev Bureau',
        people: [
          {
            name: 'Justin Valentino',
            role: 'Staff of ITDev Bureau',
            ig: 'its.justtval',
          },
          {
            name: 'Christina Tan',
            role: 'Staff of ITDev Bureau',
            ig: 'helloitschristinaa',
          },
          {
            name: 'Raden Kurniawan Agung Fitrianto',
            role: 'Staff of ITDev Bureau',
            ig: 'rad.agung',
          },
        ],
      },
    ],
  },

  {
    id: 'student-welfare',
    label: 'Student Welfare',
    short: 'SW',
    bureaus: [
      {
        id: 'sw-head',
        label: 'Head of Student Welfare',
        photo: '/images/reveal-kabinet/SW1.png',
        caption: 'Head of Student Welfare',
        people: [
          {
            name: 'Algof Kristian Zega',
            role: 'Head of Student Welfare',
            ig: 'algof.kz',
          },
        ],
      },
      {
        id: 'sw-secretary',
        label: 'Secretary of Student Welfare',
        photo: '/images/reveal-kabinet/SW2.png',
        caption: 'Secretary of Student Welfare',
        people: [
          {
            name: 'Muhammad Daffa Ramadhan',
            role: 'Secretary of Student Welfare',
            ig: 'muhdaff.ram',
          },
        ],
      },
      {
        id: 'sw-aspiration-head',
        label: 'Head & Vice Head of Aspiration Bureau',
        photo: '/images/reveal-kabinet/SW3.png',
        caption: 'Head & Vice Head of Aspiration Bureau',
        people: [
          {
            name: 'Daffa Rinali',
            role: 'Head of Aspiration Bureau',
            ig: 'daffa.rinali',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Callista Fidelya Roba Gultom',
            role: 'Vice Head of Aspiration Bureau',
            ig: 'callistadly',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'sw-academic-head',
        label: 'Head & Vice Head of Academic Bureau',
        photo: '/images/reveal-kabinet/SW4.png',
        caption: 'Head & Vice Head of Academic Bureau',
        people: [
          {
            name: 'Imelda Alexis Jovita',
            role: 'Head of Academic Bureau',
            ig: 'imeldalexis',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Nyoman Surya Hutama Andyartha',
            role: 'Vice Head of Academic Bureau',
            ig: 'mansurya.a',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'sw-aspiration-staff',
        label: 'Staff of Aspiration Bureau',
        photo: '/images/reveal-kabinet/SW5.png',
        caption: 'Staff of Aspiration Bureau',
        people: [
          {
            name: 'Bara Semangat Rohmani',
            role: 'Staff of Aspiration Bureau',
            ig: 'barasrohmani',
          },
          {
            name: 'Herdian Tri Wardhana',
            role: 'Staff of Aspiration Bureau',
            ig: 'herdiantwd_',
          },
          {
            name: 'Muhammad Naufal Hadaya Setiawan',
            role: 'Staff of Aspiration Bureau',
            ig: 'nopaalh',
          },
        ],
      },
      {
        id: 'sw-academic-staff',
        label: 'Staff of Academic Bureau',
        photo: '/images/reveal-kabinet/SW6.png',
        caption: 'Staff of Academic Bureau',
        people: [
          {
            name: 'Rennard Filbert Tanjaya',
            role: 'Staff of Academic Bureau',
            ig: 'rennard_filbert',
          },
          {
            name: 'Mario Napitupulu',
            role: 'Staff of Academic Bureau',
            ig: 'marroi_n7',
          },
          {
            name: 'Willy Marcelius',
            role: 'Staff of Academic Bureau',
            ig: 'wlymrcls_',
          },
          {
            name: 'Muhammad Khalid Ash Shiddiqi',
            role: 'Staff of Academic Bureau',
            ig: 'dolphinsan46',
          },
        ],
      },
    ],
  },

  {
    id: 'research-technology',
    label: 'Research Technology',
    short: 'RT',
    bureaus: [
      {
        id: 'rt-head',
        label: 'Head of Research Technology',
        photo: '/images/reveal-kabinet/RT1.png',
        caption: 'Head of Research Technology',
        people: [
          {
            name: 'Adinda Shafa Najla',
            role: 'Head of Research Technology',
            ig: 'dinda_2375',
          },
        ],
      },
      {
        id: 'rt-secretary',
        label: 'Secretary of Research Technology',
        photo: '/images/reveal-kabinet/RT2.png',
        caption: 'Secretary of Research Technology',
        people: [
          {
            name: 'Arya Pratama Rhama Putra',
            role: 'Secretary of Research Technology',
            ig: 'aryapratamars',
          },
        ],
      },
      {
        id: 'rt-competition-head',
        label: 'Head & Vice Head of Competition Development Bureau',
        photo: '/images/reveal-kabinet/RT3.png',
        caption: 'Head & Vice Head of Competition Development Bureau',
        people: [
          {
            name: 'Muhammad Farhan',
            role: 'Head of Competition Development Bureau',
            ig: 'farhannn891',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Isabella Sienna Sulisthio',
            role: 'Vice Head of Competition Development Bureau',
            ig: 'sienna_sien',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'rt-scientific-head',
        label: 'Head & Vice Head of Scientific Development Bureau',
        photo: '/images/reveal-kabinet/RT4.png',
        caption: 'Head & Vice Head of Scientific Development Bureau',
        people: [
          {
            name: 'Akmal Yusuf',
            role: 'Head of Scientific Development Bureau',
            ig: 'akmallys',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Kartika Nana Naulita',
            role: 'Vice Head of Scientific Development Bureau',
            ig: 'k.naulita',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'rt-competition-staff',
        label: 'Staff of Research Technology Department',
        photo: '/images/reveal-kabinet/RT5.png',
        caption: 'Staff of Research Technology Department',
        people: [
          {
            name: 'Jorell Ramos Sinaga',
            role: 'Staff of Research Technology Department',
            ig: 'intagram.com/jorell_ramos_sinaga',
          },
          {
            name: 'Angela Vania Sugiyono',
            role: 'Staff of Research Technology Department',
            ig: 'shzirley',
          },
          {
            name: 'Frenaldy Bestabba Hasugian',
            role: 'Staff of Research Technology Department',
            ig: 'frenaldyhasugian',
          },
        ],
      },
      {
        id: 'rt-scientific-staff',
        label: 'Staff of Research Technology Department',
        photo: '/images/reveal-kabinet/RT6.png',
        caption: 'Staff of Research Technology Department',
        people: [
          {
            name: 'Raziq Danish',
            role: 'Staff of Research Technology Department',
            ig: 'dnshrq',
          },
          {
            name: 'Umar Al Faris',
            role: 'Staff of Research Technology Department',
            ig: 'marr.parizz',
          },
          {
            name: 'Muhammad Hadidan Nurhaunan',
            role: 'Staff of Research Technology Department',
            ig: 'hadidan',
          },
        ],
      },
      {
        id: 'rt-staff',
        label: 'Staff of Research Technology Department',
        photo: '/images/reveal-kabinet/RT7.png',
        caption: 'Staff of Research Technology Department',
        people: [
          {
            name: 'Kamal Zaky Adinata',
            role: 'Staff of Research Technology Department',
            ig: 'kamalzaky_',
          },
          {
            name: 'Muhammad Abid Baihaqi Al Faridzi',
            role: 'Staff of Research Technology Department',
            ig: 'abidalfrzi',
          },
        ],
      },
    ],
  },

  {
    id: 'student-resource-development',
    label: 'Student Resource Development',
    short: 'SRD',
    bureaus: [
      {
        id: 'srd-head',
        label: 'Head of Student Resource Development',
        photo: '/images/reveal-kabinet/SRD1.png',
        caption: 'Head of Student Resource Development',
        people: [
          {
            name: 'Athalla Abhinaya',
            role: 'Head of Student Resource Development',
            ig: 'athallabhinaya',
          },
        ],
      },
      {
        id: 'srd-secretary',
        label: 'Secretary of Student Resource Development',
        photo: '/images/reveal-kabinet/SRD2.png',
        caption: 'Secretary of Student Resource Development',
        people: [
          {
            name: 'Nabila Shafa Rahayu',
            role: 'Secretary of Student Resource Development',
            ig: 'nabilc.a',
          },
        ],
      },
      {
        id: 'srd-bureau-head',
        label: 'Head of Traning and Mapping & Monitoring Bureau',
        photo: '/images/reveal-kabinet/SRD3.png',
        caption: 'Head of Traning and Mapping & Monitoring Bureau',
        people: [
          {
            name: 'Muhammad Rengga Putra Kuncoro',
            role: 'Head of Training Bureau',
            ig: 'rengga.__',
          },
          {
            name: 'Fauzan Hafiz Amandani',
            role: 'Head of Mapping & Monitoring Bureau',
            ig: 'fznhfz',
          },
        ],
      },
      {
        id: 'srd-regeneration-head',
        label: 'Head & Vice Head of Regeneration Bureau',
        photo: '/images/reveal-kabinet/SRD4.png',
        caption: 'Head & Vice Head of Regeneration Bureau',
        people: [
          {
            name: 'Muammar Bahalwan',
            role: 'Head of Regeneration Bureau',
            ig: 'ammrbhlwn',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Dentha Jefry Yudhiantara',
            role: 'Vice Head of Regeneration Bureau',
            ig: 'yudhiantara',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'srd-training-staff',
        label: 'Staff of Student Resource Development Department',
        photo: '/images/reveal-kabinet/SRD5.png',
        caption: 'Staff of Student Resource Development Department',
        people: [
          {
            name: 'Naufal Bintang Brillian',
            role: 'Staff of Student Resource Development Department',
            ig: 'brilliannauval',
          },
          {
            name: 'Annisa Zahra Fitria',
            role: 'Staff of Student Resource Development Department',
            ig: 'anzhra._',
          },
          {
            name: 'Alhaura Rahmatunnisa Harsanto',
            role: 'Staff of Student Resource Development Department',
            ig: 'alhauraharsanto',
          },
        ],
      },
      {
        id: 'srd-regeneration-staff',
        label: 'Staff of Student Resource Development Department',
        photo: '/images/reveal-kabinet/SRD6.png',
        caption: 'Staff of Student Resource Development Department',
        people: [
          {
            name: 'Muhammad Aditya Nugraha',
            role: 'Staff of Student Resource Development Department',
            ig: 'just.ditz',
          },
          {
            name: 'Kayla Riza Putri Irjayanto',
            role: 'Staff of Student Resource Development Department',
            ig: 'kaylarizaa',
          },
          {
            name: 'Shafira Nauraishma Zahida',
            role: 'Staff of Student Resource Development Department',
            ig: 'hey__shafzz',
          },
        ],
      },
    ],
  },

  {
    id: 'entrepreneurship-development',
    label: 'Entrepreneurship Development',
    short: 'EDD',
    bureaus: [
      {
        id: 'edd-head',
        label: 'Head of Entrepreneurship Development',
        photo: '/images/reveal-kabinet/EDD1.png',
        caption: 'Head of Entrepreneurship Development',
        people: [
          {
            name: 'Mandy Alphafyn Imanuel Tjandra',
            role: 'Head of Entrepreneurship Development',
            ig: 'mandy_tjandra05',
          },
        ],
      },
      {
        id: 'edd-secretary',
        label: 'Secretary of Entrepreneurship Development',
        photo: '/images/reveal-kabinet/EDD2.png',
        caption: 'Secretary of Entrepreneurship Development',
        people: [
          {
            name: 'Pradhipta Raja Mahendra',
            role: 'Secretary of Entrepreneurship Development',
            ig: 'pradhipta_rm',
          },
        ],
      },
      {
        id: 'edd-rnd-head',
        label: 'Head & Vice Head of Research and Development Bureau',
        photo: '/images/reveal-kabinet/EDD3.png',
        caption: 'Head & Vice Head of Research and Development Bureau',
        people: [
          {
            name: 'Ziyad Raziq Lahitidra Afey',
            role: 'Head of Research and Development Bureau',
            ig: 'ini.ziyad',
            gridIndices: [
              6, 7, 8, 9, 10, 11,
              18, 19, 20, 21, 22, 23,
              30, 31, 32, 33, 34, 35,
              42, 43, 44, 45, 46, 47,
              54, 55, 56, 57, 58, 59,
              66, 67, 68, 69, 70, 71,
              78, 79, 80, 81, 82, 83,
              90, 91, 92, 93, 94, 95,
              102, 103, 104, 105, 106, 107,
              114, 115, 116, 117, 118, 119,
              126, 127, 128, 129, 130, 131,
              138, 139, 140, 141, 142, 143
            ]
          },
          {
            name: 'Farrel Ahmad Lazuardi',
            role: 'Vice Head of Research and Development Bureau',
            ig: 'farrelahmad_',
            gridIndices: [
              0, 1, 2, 3, 4, 5,
              12, 13, 14, 15, 16, 17,
              24, 25, 26, 27, 28, 29,
              36, 37, 38, 39, 40, 41,
              48, 49, 50, 51, 52, 53,
              60, 61, 62, 63, 64, 65,
              72, 73, 74, 75, 76, 77,
              84, 85, 86, 87, 88, 89,
              96, 97, 98, 99, 100, 101,
              108, 109, 110, 111, 112, 113,
              120, 121, 122, 123, 124, 125,
              132, 133, 134, 135, 136, 137,
            ]
          },
        ],
      },
      {
        id: 'edd-computrade-head',
        label: 'Head & Vice Head of Computrade Bureau',
        photo: '/images/reveal-kabinet/EDD4.png',
        caption: 'Head & Vice Head of Computrade Bureau',
        people: [
          {
            name: 'Agil Lukman Hakim Muchdi',
            role: 'Head of Computrade Bureau',
            ig: 'agil_7852',
          },
          {
            name: 'Muhammad Nawfal Alfanni Darussalam',
            role: 'Vice Head of Computrade Bureau',
            ig: 'm.nwfl_',
          },
        ],
      },
      {
        id: 'edd-rnd-staff',
        label: 'Staff of Research and Development Bureau',
        photo: '/images/reveal-kabinet/EDD5.png',
        caption: 'Staff of Research and Development Bureau',
        people: [
          {
            name: 'Arvito Rajapandya Natlysandro',
            role: 'Staff of Research and Development Bureau',
            ig: 'vitothedude',
          },
          {
            name: 'Farrel Jeremia Santoso',
            role: 'Staff of Research and Development Bureau',
            ig: 'jeremia_santoso',
          },
          {
            name: 'Ramasyamsi Ahmad Shabri',
            role: 'Staff of Research and Development Bureau',
            ig: 'ramasyamss',
          },
        ],
      },
      {
        id: 'edd-computrade-staff',
        label: 'Staff of Computrade Bureau',
        photo: '/images/reveal-kabinet/EDD6.png',
        caption: 'Staff of Computrade Bureau',
        people: [
          {
            name: 'Aqil Syafiq Dzaky',
            role: 'Staff of Computrade Bureau',
            ig: 'aqilsyafiq_dzaky',
            gridIndices: [
              0, 1, 2,
              12, 13, 14,
              24, 25, 26,
              36, 37, 38,
              48, 49, 50,
              60, 61, 62,
            ]
          },
          {
            name: 'Ja`far Abdurrahman Shidiq',
            role: 'Staff of Computrade Bureau',
            ig: 'jfr.as',
            gridIndices: [
              72, 73, 74, 75, 76, 77, 78,
              84, 85, 86, 87, 88, 89, 90,
              96, 97, 98, 99, 100, 101, 102,
              108, 109, 110, 111, 112, 113, 114,
              120, 121, 122, 123, 124, 125, 126,
              132, 133, 134, 135, 136, 137, 138,
            ]
          },
          {
            name: 'Muhammad Fathan Haiban Rafif ',
            role: 'Staff of Computrade Bureau',
            ig: 'fathanhafif',
            gridIndices: [
              3, 4, 5, 6,
              15, 16, 17, 18,
              27, 28, 29, 30,
              39, 40, 41, 42,
              51, 52, 53, 54,
              63, 64, 65, 66,
            ]
          },
          {
            name: 'Nuha Usama Okbah',
            role: 'Staff of Computrade Bureau',
            ig: 'nuoooyyy_',
            gridIndices: [
              7, 8, 9, 10, 11,
              19, 20, 21, 22, 23,
              31, 32, 33, 34, 35,
              43, 44, 45, 46, 47,
              55, 56, 57, 58, 59,
              67, 68, 69, 70, 71,
              79, 80, 81, 82, 83,
              91, 92, 93, 94, 95,
              103, 104, 105, 106, 107,
              115, 116, 117, 118, 119,
              127, 128, 129, 130, 131,
              139, 140, 141, 142, 143
            ]
          },
        ],
      },
    ],
  },

  {
    id: 'flexoo',
    label: 'Flexoo',
    short: 'Flexoo',
    bureaus: [
      {
        id: 'flexoo-bureau',
        label: 'Chief Executive Officer of Flexoo',
        photo: '/images/reveal-kabinet/Flexoo.png',
        caption: 'Chief Executive Officer of Flexoo',
        people: [
          {
            name: 'Dzaky Rantisi Salim',
            role: 'CEO of Flexoo',
            ig: 'dzakyrantisi',
          },
        ],
      },
    ],
  },

  {
    id: 'dpa',
    label: 'Dewan Perwakilan Angkatan',
    short: 'DPA',
    bureaus: [
      {
        id: 'dpa-bureau',
        label: 'Head of Dewan Perwakilan Angkatan',
        photo: '/images/reveal-kabinet/DPA1.png',
        caption: 'Head of Dewan Perwakilan Angkatan',
        people: [
          {
            name: 'Felda Ega Fadhila',
            role: 'Head of DPA',
            ig: 'felda.ega',
          },
        ],
      },
      {
        id: 'dpa-bureau',
        label: 'Vice Head of Dewan Perwakilan Angkatan',
        photo: '/images/reveal-kabinet/DPA2.png',
        caption: 'Vice Head of Dewan Perwakilan Angkatan',
        people: [
          {
            name: 'Yudha Putra Dwinanda',
            role: 'Vice Head of DPA',
            ig: 'yudhaputradw_',
          },
        ],
      },
    ],
  },

  {
    id: 'schematics',
    label: 'Project Officer of Schematics',
    short: 'Schematics',
    bureaus: [
      {
        id: 'schematics-bureau',
        label: 'Project Officer of Schematics',
        photo: '/images/reveal-kabinet/Schematics.png',
        caption: 'Project Officer of Schematics',
        people: [
          {
            name: 'Naufal Bintang Brillian',
            role: 'Project Officer',
            ig: 'brilliannauval',
          },
        ],
      },
    ],
  },
];

const HMTC_SLIDES = HMTC_DEPARTMENTS.flatMap((dept) =>
  dept.bureaus.map((bureau) => ({
    deptId: dept.id,
    deptLabel: dept.label,
    deptShort: dept.short,
    ...bureau,
  })),
);

function getPersonGridIndices(person: Person) {
  if (person.gridIndices?.length) return person.gridIndices;
  if (typeof person.gridIndex === 'number') return [person.gridIndex];
  return [];
}

function getDefaultOwnerIndex(slide: Slide, cellIndex: number) {
  if (slide.people.length === 0) return -1;
  if (slide.people.length === 1) return 0;

  const x = (cellIndex % GRID_COLS) / GRID_COLS;
  return Math.min(slide.people.length - 1, Math.floor(x * slide.people.length));
}

function getSlideCellOwnerIndex(slide: Slide, cellIndex: number) {
  const ownerIndex = slide.people.findIndex((person) =>
    getPersonGridIndices(person).includes(cellIndex),
  );
  const hasGrid = slide.people.some((person) => getPersonGridIndices(person).length > 0);

  if (ownerIndex !== -1) return ownerIndex;
  if (!hasGrid) return getDefaultOwnerIndex(slide, cellIndex);

  return -1;
}

function getSlidePointerIndex(
  slide: Slide,
  clientX: number,
  clientY: number,
  rect: DOMRect,
) {
  const x = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 0.999999);
  const y = Math.min(Math.max(0, (clientY - rect.top) / rect.height), 0.999999);
  const cell = Math.floor(y * GRID_ROWS) * GRID_COLS + Math.floor(x * GRID_COLS);
  const hasGrid = slide.people.some((person) => getPersonGridIndices(person).length > 0);

  if (hasGrid) {
    return slide.people.findIndex((person) =>
      getPersonGridIndices(person).includes(cell),
    );
  }

  return Math.min(
    slide.people.length - 1,
    Math.max(0, Math.floor(x * slide.people.length)),
  );
}

function IgGlyph5() {
  return (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.7'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='inline-block'
      style={{ verticalAlign: '-2px' }}
    >
      <rect x='3' y='3' width='18' height='18' rx='5' />
      <circle cx='12' cy='12' r='4' />
      <circle cx='17.5' cy='6.5' r='0.9' fill='currentColor' />
    </svg>
  );
}

export default function RevealKabinet({
  trigger = 'hover',
}: {
  trigger?: string;
  ratio?: string;
}) {
  const slides = HMTC_SLIDES;
  const depts = HMTC_DEPARTMENTS;
  const [si, setSi] = useState(0);
  const [pi, setPi] = useState<number | null>(null);
  const slide = slides[si];
  const isHover = trigger === 'hover';
  const photoRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHover || !photoRef.current) return;
    const rect = photoRef.current.getBoundingClientRect();
    const nextIndex = getSlidePointerIndex(slide, e.clientX, e.clientY, rect);
    setPi(nextIndex >= 0 ? nextIndex : null);
  };

  const bindRow = (i: number) =>
    isHover
      ? { onMouseEnter: () => setPi(i), onMouseLeave: () => setPi(null) }
      : { onClick: () => setPi((p) => (p === i ? null : i)) };

  const stepP = (d: number) =>
    setPi((p) => ((p ?? -1) + d + slide.people.length) % slide.people.length);
  const next = () => {
    setPi(null);
    setSi((si + 1) % slides.length);
  };
  const prev = () => {
    setPi(null);
    setSi((si - 1 + slides.length) % slides.length);
  };

  const active = pi != null ? slide.people[pi] : null;

  return (
    <div className='box-border flex flex-col overflow-hidden bg-[#0B0B0C] p-[28px_44px] py-28 font-sans text-[#EDEAE2] md:px-[16%]'>
      <div className='flex items-center gap-4 border-b border-white/12 pb-3 text-[11px] tracking-[0.18em] text-white/55 uppercase'>
        <span className='font-semibold tracking-[0.22em] text-white'>
          HMTC<span className='px-1 opacity-50'>·</span>ITS
        </span>
        <span className='flex-1'>— Pengurus Kabinet 2026</span>
        <span className='tabular-nums'>
          Vol. {String(si + 1).padStart(2, '0')} /{' '}
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>
      <div className='flex items-end justify-between gap-8 py-4'>
        <h1 className='m-0 font-serif text-[48px] leading-[0.95] font-normal tracking-[-0.02em]'>
          The <em className='text-[#2B7FFF] italic'>Faces</em>
          <br />
          Behind HMTC.
        </h1>
        <div className='flex max-w-[480px] flex-wrap justify-end gap-1.5'>
          {depts.map((d) => {
            const isOn = d.id === slide.deptId;
            return (
              <button
                key={d.id}
                onClick={() => {
                  const idx = slides.findIndex((s) => s.deptId === d.id);
                  if (idx >= 0) {
                    setPi(null);
                    setSi(idx);
                  }
                }}
                className={`cursor-pointer border border-white/20 bg-transparent px-2.5 py-1.5 text-[10px] tracking-[0.05em] ${isOn ? 'border-white bg-white text-[#0B0B0C]' : 'text-white/70'}`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.001, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}
        aria-hidden
      >
        {([-2, -1, 1, 2] as const).map((offset) => {
          const idx = (si + offset + slides.length) % slides.length;
          return (
            <Image
              key={slides[idx].id}
              src={slides[idx].photo}
              alt=""
              width={500}
              height={300}
            />
          );
        })}
      </div>
      <div className='flex flex-1 grid-cols-2 flex-wrap justify-center gap-7'>
        <div
          ref={photoRef}
          className={`relative w-fit cursor-crosshair self-start overflow-hidden rounded-[4px]`}
          onMouseMove={onMove}
          onMouseLeave={() => isHover && setPi(null)}
          onClick={() => !isHover && stepP(1)}
        >
          <div className='relative h-fit w-fit'>
            <Image
              key={slide.id}
              src={slide.photo}
              alt={slide.caption}
              className='w-full object-contain lg:w-[30dvw]'
              style={{
                filter: 'saturate(0.9) contrast(1.03)',
                objectFit: 'contain',
                animation: 'rkImgIn 200ms ease',
              }}
              width={500}
              height={300}
              priority
              draggable={false}
            />
            <div className='pointer-events-none absolute inset-0 grid h-full w-full grid-cols-12 grid-rows-12'>
              {Array.from({ length: GRID_CELLS }, (_, cellIndex) => {
                const ownerIndex = getSlideCellOwnerIndex(slide, cellIndex);
                const isActive = ownerIndex === pi;

                return (
                  <div
                    key={cellIndex}
                    className={`transition-colors duration-200 ease-out ${isActive ? 'bg-white/10' : pi != null ? 'bg-black/30' : 'bg-transparent'} ${cellIndex % GRID_COLS !== GRID_COLS - 1 ? 'border-r border-white/8' : ''} ${cellIndex < GRID_CELLS - GRID_COLS ? 'border-b border-white/8' : ''}`}
                  />
                );
              })}
            </div>
            <div
              className='pointer-events-none absolute top-3 left-3 flex items-baseline gap-1 text-white sm:top-4 sm:left-5'
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              <span className='text-[min(48px,8vw)] leading-[0.9] italic xl:text-[64px]'>
                {pi != null ? String(pi + 1).padStart(2, '0') : '—'}
              </span>
              <span className='px-[4px] text-[min(24px,4vw)] opacity-50'>
                /
              </span>
              <span className='text-[min(18px,3vw)] opacity-65'>
                {String(slide.people.length).padStart(2, '0')}
              </span>
            </div>
            {active && (
              <div
                className='pointer-events-auto absolute bottom-3 left-3 max-w-[380px] sm:bottom-5 sm:left-5'
                style={{ animation: 'v5fade 280ms ease' }}
              >
                <div className='mb-1.5 text-[min(2dvw,10px)] tracking-[0.2em] text-white/75 uppercase'>
                  {active.role}
                </div>
                <div className='mb-3 font-serif text-[min(4dvw,28px)] leading-[1.05] tracking-[-0.01em] text-white'>
                  {active.name}
                </div>
                <a
                  href={`https://instagram.com/${active.ig}`}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-2 rounded-full border border-white/40 px-2 py-1 text-[clamp(10px,2vw,14px)] text-white no-underline backdrop-blur-sm sm:px-3 sm:py-2'
                  onClick={(e) => e.stopPropagation()}
                >
                  <IgGlyph5 /> @{active.ig}
                  <span className='ml-1 opacity-70'>↗</span>
                </a>
              </div>
            )}
            <div className='pointer-events-none absolute top-3 right-3 border border-white/20 bg-[#0B0B0C]/50 px-2 py-1 text-[1.5vw] tracking-[0.16em] text-white/85 uppercase backdrop-blur-sm sm:top-4 sm:right-5 sm:px-2 sm:py-1 sm:text-[10px]'>
              {slide.label}
            </div>
          </div>
        </div>

        <aside className='flex w-full flex-1 flex-col border-t border-b border-white/20'>
          <div className='border-b border-white/12 p-4'>
            <div className='mb-1.5 text-[10px] tracking-[0.18em] text-white/55 uppercase'>
              {slide.deptLabel}
            </div>
            <div className='font-serif text-[22px] leading-[1.1] text-white italic'>
              {slide.label}
            </div>
            <div className='mt-1 text-[11px] text-white/55'>
              {slide.people.length} pengurus
            </div>
          </div>
          <ul className='m-0 flex-1 list-none overflow-hidden p-2'>
            {slide.people.map((p, i) => (
              <li
                key={i}
                {...bindRow(i)}
                className={`ease grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-white/8 py-3 transition-all duration-200 ${pi === i ? '-mx-2.5 bg-white pr-2.5 pl-2.5 text-[#0B0B0C]' : ''} ${pi != null && pi !== i ? 'opacity-35' : ''}`}
              >
                <span className='font-serif text-[16px] italic'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className='flex min-w-0 flex-col gap-0.5'>
                  <span className='truncate text-[13px] font-medium'>
                    {p.name}
                  </span>
                  <span className='text-[10px] opacity-70'>{p.role}</span>
                </div>
                <a
                  href={`https://instagram.com/${p.ig}`}
                  target='_blank'
                  rel='noreferrer'
                  className='grid h-[28px] w-[28px] cursor-pointer place-items-center rounded-full border border-current text-current no-underline opacity-70'
                  onClick={(e) => e.stopPropagation()}
                >
                  <IgGlyph5 />
                </a>
              </li>
            ))}
          </ul>
          <div className='flex items-center gap-3 pt-3'>
            <button
              onClick={prev}
              className='h-[36px] w-[36px] cursor-pointer rounded-full border border-white/40 bg-transparent text-[14px] text-white'
              aria-label='Previous'
            >
              ←
            </button>
            <div className='flex flex-1 flex-wrap justify-center gap-1'>
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-[2px] w-[14px] ${i === si ? 'bg-[#D4C9A8]' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className='h-[36px] w-[36px] cursor-pointer rounded-full border border-white/40 bg-transparent text-[14px] text-white'
              aria-label='Next'
            >
              →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
