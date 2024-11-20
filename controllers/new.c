#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void main()
{
    FILE *f1, *f2, *f3, *f4, *f5;
    int len, i, pos = 1;
    char arg[20], mne[20], opnd[20], la[20], name[20], mne1[20], opnd1[20], pos1[10], pos2[10];

    // Open files
    f1 = fopen("inputmacro.txt", "r");
    f2 = fopen("namtab.txt", "w+");
    f3 = fopen("deftab.txt", "w+");
    f4 = fopen("argtab.txt", "w+");
    f5 = fopen("opmacro.txt", "w+");

    // Check if files opened successfully
    if (f1 == NULL || f2 == NULL || f3 == NULL || f4 == NULL || f5 == NULL)
    {
        printf("Error opening files.\n");
        exit(1);
    }

    fscanf(f1, "%s%s%s", la, mne, opnd);

    while (strcmp(mne, "END") != 0)
    {
        if (strcmp(mne, "MACRO") == 0)
        {
            fprintf(f2, "%s\n", la); // Writing macro name to namtab
            fseek(f2, SEEK_SET, 0);
            fprintf(f3, "%s\t%s\n", la, opnd); // Writing macro definition header to deftab

            // Reset pos for new macro definition
            pos = 1;
            fscanf(f1, "%s%s%s", la, mne, opnd);

            // Store macro definition with positional notation
            while (strcmp(mne, "MEND") != 0)
            {
                if (opnd[0] == '&')
                {
                    snprintf(pos1, sizeof(pos1), "%d", pos);
                    strcpy(pos2, "?");
                    strcat(pos2, pos1);
                    strcpy(opnd, pos2);
                    pos++;
                }
                fprintf(f3, "%s\t%s\n", mne, opnd);
                fscanf(f1, "%s%s%s", la, mne, opnd);
            }
            fprintf(f3, "%s\n", mne); // Final MEND for macro
        }
        else
        {
            // Macro expansion phase
            fscanf(f2, "%s", name); // Read macro name from namtab
            if (strcmp(mne, name) == 0)
            {
                len = strlen(opnd);

                // Split arguments by commas and write to argtab
                for (i = 0; i < len; i++)
                {
                    if (opnd[i] != ',')
                    {
                        fprintf(f4, "%c", opnd[i]);
                    }
                    else
                    {
                        fprintf(f4, "\n");
                    }
                }
                fprintf(f4, "\n"); // End of arguments
                fseek(f3, SEEK_SET, 0);
                fseek(f4, SEEK_SET, 0);

                fscanf(f3, "%s%s", mne1, opnd1);
                fscanf(f3, "%s%s", mne1, opnd1);
                // Replace positional notation with actual arguments
                while (strcmp(mne1, "MEND") != 0)
                {
                    if (opnd1[0] == '?')
                    {
                        int argNum = atoi(opnd1 + 1) - 1; // Extract argument index
                        fseek(f4, SEEK_SET, 0);           // Reset argtab pointer

                        // Retrieve the correct argument from argtab
                        for (int j = 0; j <= argNum; j++)
                        {
                            fscanf(f4, "%s", arg);
                        }
                        fprintf(f5, "-\t%s\t%s\n", mne1, arg); // Replace positional with actual argument
                    }
                    else
                    {
                        fprintf(f5, "-\t%s\t%s\n", mne1, opnd1);
                    }
                    fscanf(f3, "%s%s", mne1, opnd1);
                }
            }
            else
            {
                // Non-macro instruction
                fprintf(f5, "%s\t%s\t%s\n", la, mne, opnd);
            }
        }
        fscanf(f1, "%s%s%s", la, mne, opnd);
    }

    // Final line
    fprintf(f5, "%s\t%s\t%s\n", la, mne, opnd);

    // Close all files
    fclose(f1);
    fclose(f2);
    fclose(f3);
    fclose(f4);
    fclose(f5);

    printf("COMPLETED SUCCESSFULLY!! \n");
}