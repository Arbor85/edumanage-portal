using EduManage.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduManage.Infrastructure.Persistence.Configurations;

public class TrainerCourseAssociationConfiguration : IEntityTypeConfiguration<TrainerCourseAssociation>
{
    public void Configure(EntityTypeBuilder<TrainerCourseAssociation> builder)
    {
        builder.HasKey(a => a.Id);
    }
}
